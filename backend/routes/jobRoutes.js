import express from 'express';
import Job from '../models/Job.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const slugify = (text) =>
  text.toString().toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// GET /api/jobs - list with filters, search, pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { tag, search, jobType, location, experience } = req.query;

    const filter = { isActive: true };
    if (tag) filter.tags = tag;
    if (jobType) filter.jobType = jobType;
    if (experience) filter.experience = experience;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('author', 'name'),
      Job.countDocuments(filter),
    ]);

    res.json({ jobs, totalPages: Math.max(1, Math.ceil(total / limit)), currentPage: page, total });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/tags - all distinct tags
router.get('/tags', async (req, res) => {
  try {
    const tags = await Job.distinct('tags', { isActive: true });
    res.json(tags);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/recommended?tags=React,Node&exclude=id - tag-based recommendations
router.get('/recommended', async (req, res) => {
  try {
    const tags = req.query.tags ? req.query.tags.split(',') : [];
    const exclude = req.query.exclude ? req.query.exclude.split(',') : [];

    if (tags.length === 0) {
      const latest = await Job.find({ isActive: true, _id: { $nin: exclude } })
        .sort({ createdAt: -1 }).limit(6).populate('author', 'name');
      return res.json(latest);
    }

    const recommended = await Job.find({
      isActive: true,
      _id: { $nin: exclude },
      tags: { $in: tags },
    }).sort({ createdAt: -1 }).limit(6).populate('author', 'name');

    res.json(recommended);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/id/:id - by id (admin edit)
router.get('/id/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/:slug - single job (public)
router.get('/:slug', async (req, res) => {
  try {
    const job = await Job.findOne({ slug: req.params.slug }).populate('author', 'name');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/jobs - create (admin)
router.post('/', protect, async (req, res) => {
  try {
    const { title, excerpt, description, company, companyLogo, location, jobType, salary, experience, qualification, tags, applyLink, coverImage, deadline } = req.body;

    let slug = slugify(title);
    const existing = await Job.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const job = await Job.create({
      title, slug, excerpt, description, company, companyLogo, location, jobType,
      salary, experience, qualification, tags, applyLink, coverImage, deadline,
      author: req.user.id,
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// PUT /api/jobs/:id - update (admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const fields = ['excerpt', 'description', 'company', 'companyLogo', 'location', 'jobType', 'salary', 'experience', 'qualification', 'tags', 'applyLink', 'coverImage', 'deadline', 'isActive'];
    fields.forEach((f) => { if (req.body[f] !== undefined) job[f] = req.body[f]; });

    if (req.body.title && req.body.title !== job.title) {
      job.title = req.body.title;
      job.slug = slugify(req.body.title);
    }

    await job.save();
    res.json(job);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/jobs/:id - delete (admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
