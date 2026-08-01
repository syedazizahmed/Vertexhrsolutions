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
import Post from './models/Post.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
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
app.use('/api/posts', postRoutes);
app.use('/api/upload', uploadRoutes);

// Dynamic sitemap so search engines discover every post, generated fresh from the DB each request
app.get('/sitemap.xml', async (req, res) => {
  const posts = await Post.find({}, 'slug updatedAt').sort({ createdAt: -1 });

  const urls = [
    `<url><loc>${siteUrl()}/</loc><changefreq>daily</changefreq></url>`,
    ...posts.map(
      (post) =>
        `<url><loc>${siteUrl()}/post/${post.slug}</loc><lastmod>${post.updatedAt.toISOString()}</lastmod></url>`
    ),
  ];

  res.type('application/xml');
  res.send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`
  );
});

// Crawlers that don't run JS (WhatsApp, Telegram, Facebook, etc.) get a small pre-rendered
// HTML page with the real meta tags instead of the empty SPA shell. Real browsers fall through
// to the React app below via next().
app.get('/', (req, res, next) => {
  if (!isBot(req.headers['user-agent'])) return next();

  res.send(
    renderMetaHtml({
      title: 'Jobcode Clone | Latest Job Openings',
      description: 'Latest fresher and experienced job openings, internships, and off-campus drives.',
      url: siteUrl(),
      redirectTo: siteUrl(),
    })
  );
});

app.get('/post/:slug', async (req, res, next) => {
  if (!isBot(req.headers['user-agent'])) return next();

  const post = await Post.findOne({ slug: req.params.slug });
  if (!post) return next();

  const url = `${siteUrl()}/post/${post.slug}`;
  res.send(
    renderMetaHtml({
      title: `${post.title} | Jobcode Clone`,
      description: post.excerpt,
      url,
      image: post.coverImage,
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
    res.send('Jobcode API running (frontend not built — run `npm run build` in /frontend to enable unified serving)')
  );
}

// Multer errors (bad file type, file too large) land here instead of the route handler
app.use((err, req, res, next) => {
  if (err) return res.status(400).json({ message: err.message });
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
