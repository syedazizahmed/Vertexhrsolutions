import express from 'express';
import Job from '../models/Job.js';

const router = express.Router();

const SITE_OVERVIEW = `You are the AI assistant embedded on Vertex HR Solutions, a job board website. Answer visitor questions using the site knowledge below. Be concise and friendly. Only discuss Vertex HR Solutions, jobs, careers, or the application process — politely steer back if asked something unrelated.

## About the site
Vertex HR Solutions connects job seekers with employers across industries. Jobs are curated and posted by the Vertex HR team.

## For job seekers
- Browse all jobs on the homepage, or filter by category: Freshers, Experienced, Internships (via the category menu, the hamburger icon top-left).
- Search jobs by title, company, or location using the search bar.
- View full job details (description, salary, qualifications, tags) by clicking a job card.
- Create a free account ("Register") to apply — requires verifying your email with a one-time code sent to your inbox.
- Apply to a job with: resume upload, cover letter, LinkedIn URL, portfolio URL, current CTC, expected CTC, and notice period.
- Track your applications and their status (New, Reviewed, Shortlisted, Rejected) on the "Applied Jobs" page.
- You'll get an email notification automatically if you're shortlisted or rejected for a role.
- Save jobs you're interested in for later.

## Contact
The footer has links to Instagram, LinkedIn, X (Twitter), WhatsApp, and email for reaching Vertex HR Solutions directly.

## What you cannot do
You cannot submit applications, change account details, or access a specific user's personal application data — direct users to the relevant page on the site for those actions.`;

const formatJobsContext = (jobs) => {
  if (jobs.length === 0) return 'There are currently no active job listings on the site.';
  const lines = jobs.map((j) =>
    `- "${j.title}" at ${j.company} — ${j.location}, ${j.jobType}${j.experience ? `, ${j.experience}` : ''}${j.salary ? `, salary: ${j.salary}` : ''} (tags: ${(j.tags || []).join(', ') || 'none'})`
  );
  return `## Currently open jobs (live data, ${jobs.length} active)\n${lines.join('\n')}`;
};

// POST /api/chat - proxy to Groq so the API key never reaches the browser
router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'messages array is required' });
    }

    const jobs = await Job.find({ isActive: true })
      .select('title company location jobType experience salary tags')
      .sort({ createdAt: -1 })
      .limit(50);

    const systemPrompt = `${SITE_OVERVIEW}\n\n${formatJobsContext(jobs)}`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.6,
        max_tokens: 400,
      }),
    });

    const data = await groqRes.json();
    if (!groqRes.ok) {
      return res.status(502).json({ message: data.error?.message || 'Chat provider error' });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
