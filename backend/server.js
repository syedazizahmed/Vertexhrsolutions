import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { uploadsDir } from './middleware/upload.js';
import { isBot } from './utils/botDetect.js';
import { renderMetaHtml } from './utils/renderMetaHtml.js';
import Job from './models/Job.js';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import seekerRoutes from './routes/seekerRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();
connectDB();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
const hasFrontendBuild = fs.existsSync(frontendDist);
const siteUrl = () => process.env.SITE_URL || 'http://localhost:5173';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/seekers', seekerRoutes);
app.use('/api/upload', uploadRoutes);

// Dynamic sitemap
app.get('/sitemap.xml', async (req, res) => {
  const jobs = await Job.find({ isActive: true }, 'slug updatedAt').sort({ createdAt: -1 });
  const urls = [
    `<url><loc>${siteUrl()}/</loc><changefreq>daily</changefreq></url>`,
    ...jobs.map(
      (job) =>
        `<url><loc>${siteUrl()}/jobs/${job.slug}</loc><lastmod>${job.updatedAt.toISOString()}</lastmod></url>`
    ),
  ];
  res.type('application/xml');
  res.send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`
  );
});

// Bot pre-rendering for social sharing
app.get('/', (req, res, next) => {
  if (!isBot(req.headers['user-agent'])) return next();
  res.send(
    renderMetaHtml({
      title: 'Vertex HR Solutions | Find Your Dream Job',
      description: 'Vertex HR Solutions connects top talent with leading companies. Browse thousands of job openings across industries.',
      url: siteUrl(),
      redirectTo: siteUrl(),
    })
  );
});

app.get('/jobs/:slug', async (req, res, next) => {
  if (!isBot(req.headers['user-agent'])) return next();
  const job = await Job.findOne({ slug: req.params.slug });
  if (!job) return next();
  const url = `${siteUrl()}/jobs/${job.slug}`;
  res.send(
    renderMetaHtml({
      title: `${job.title} at ${job.company} | Vertex HR Solutions`,
      description: job.excerpt,
      url,
      image: job.coverImage,
      redirectTo: url,
      type: 'article',
    })
  );
});

if (hasFrontendBuild) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
} else {
  app.get('/', (req, res) =>
    res.send('Vertex HR Solutions API running')
  );
}

app.use((err, req, res, next) => {
  if (err) return res.status(400).json({ message: err.message });
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Vertex HR Solutions server running on port ${PORT}`));
