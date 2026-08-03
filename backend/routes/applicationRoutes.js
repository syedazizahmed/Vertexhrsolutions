import express from 'express';
import jwt from 'jsonwebtoken';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { protect } from '../middleware/auth.js';
import { resumeUpload } from '../middleware/upload.js';

const router = express.Router();

// Best-effort: if a valid seeker token is present, resolve their id; otherwise proceed as guest.
const resolveSeekerId = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.role === 'seeker' ? decoded.id : null;
  } catch {
    return null;
  }
};

// POST /api/applications/:jobId - submit application
router.post('/:jobId', resumeUpload.single('resume'), async (req, res) => {
  try {
    const seekerId = resolveSeekerId(req);
    if (!seekerId) return res.status(401).json({ message: 'Please sign in to apply for this job.' });

    const job = await Job.findById(req.params.jobId);
    if (!job || !job.isActive) return res.status(404).json({ message: 'Job not found or closed' });

    const { name, email, phone, coverLetter, linkedin, portfolio, currentCompany, currentCTC, expectedCTC, noticePeriod } = req.body;

    const existing = await Application.findOne({ job: req.params.jobId, $or: [{ seeker: seekerId }, { email }] });
    if (existing) return res.status(400).json({ message: 'You have already applied for this job.' });

    const resume = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null;

    const application = await Application.create({
      job: req.params.jobId,
      seeker: seekerId,
      name, email, phone, resume, coverLetter,
      linkedin, portfolio, currentCompany,
      currentCTC, expectedCTC, noticePeriod,
    });

    res.status(201).json({ message: 'Application submitted successfully', id: application._id });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// GET /api/applications/mine - applications submitted by the logged-in seeker
router.get('/mine', protect, async (req, res) => {
  if (req.user.role !== 'seeker') return res.status(403).json({ message: 'Forbidden' });
  try {
    const applications = await Application.find({ seeker: req.user.id })
      .sort({ createdAt: -1 })
      .populate('job', 'title company location slug jobType isActive');
    res.json(applications);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/applications/check/:jobId - has the logged-in seeker already applied?
router.get('/check/:jobId', protect, async (req, res) => {
  if (req.user.role !== 'seeker') return res.status(403).json({ message: 'Forbidden' });
  try {
    const existing = await Application.findOne({ job: req.params.jobId, seeker: req.user.id });
    res.json({ applied: !!existing });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/applications - all applications (admin)
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { jobId, status, search } = req.query;

    const filter = {};
    if (jobId) filter.job = jobId;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('job', 'title company'),
      Application.countDocuments(filter),
    ]);

    res.json({ applications, totalPages: Math.max(1, Math.ceil(total / limit)), currentPage: page, total });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/applications/:id - single application (admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('job', 'title company location');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json(application);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/applications/:id/status - update status (admin)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json(application);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
