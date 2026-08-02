import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Seeker from '../models/Seeker.js';
import Job from '../models/Job.js';

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id, role: 'seeker' }, process.env.JWT_SECRET, { expiresIn: '7d' });

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorised' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'seeker') return res.status(403).json({ message: 'Forbidden' });
    req.seeker = await Seeker.findById(decoded.id).select('-password');
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// POST /api/seekers/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await Seeker.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const seeker = await Seeker.create({ name, email, password: hashed });

    res.status(201).json({ token: signToken(seeker._id), name: seeker.name, email: seeker.email });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/seekers/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const seeker = await Seeker.findOne({ email });
    if (!seeker) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, seeker.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ token: signToken(seeker._id), name: seeker.name, email: seeker.email });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/seekers/view/:jobId - track a job view
router.post('/view/:jobId', protect, async (req, res) => {
  try {
    const alreadyViewed = req.seeker.viewedJobs.some(
      (v) => v.job.toString() === req.params.jobId
    );

    if (!alreadyViewed) {
      await Seeker.findByIdAndUpdate(req.seeker._id, {
        $push: { viewedJobs: { $each: [{ job: req.params.jobId }], $slice: -50 } },
      });
    }

    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/seekers/me - profile + view history tags
router.get('/me', protect, async (req, res) => {
  try {
    const seeker = await Seeker.findById(req.seeker._id)
      .populate({ path: 'viewedJobs.job', select: 'tags title slug' })
      .select('-password');

    const tagFreq = {};
    seeker.viewedJobs.forEach(({ job }) => {
      if (job?.tags) job.tags.forEach((t) => { tagFreq[t] = (tagFreq[t] || 0) + 1; });
    });
    const interestTags = Object.entries(tagFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    res.json({ name: seeker.name, email: seeker.email, interestTags, viewedJobs: seeker.viewedJobs });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/seekers/save/:jobId - save/unsave a job
router.post('/save/:jobId', protect, async (req, res) => {
  try {
    const seeker = await Seeker.findById(req.seeker._id);
    const idx = seeker.savedJobs.indexOf(req.params.jobId);
    if (idx === -1) seeker.savedJobs.push(req.params.jobId);
    else seeker.savedJobs.splice(idx, 1);
    await seeker.save();
    res.json({ saved: idx === -1 });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
