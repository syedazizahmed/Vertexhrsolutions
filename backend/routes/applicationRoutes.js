import express from 'express';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// POST /api/applications/:jobId - submit application
router.post('/:jobId', upload.single('resume'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job || !job.isActive) return res.status(404).json({ message: 'Job not found or closed' });

    const { name, email, phone, coverLetter, linkedin, portfolio, currentCompany, currentCTC, expectedCTC, noticePeriod } = req.body;

    const existing = await Application.findOne({ job: req.params.jobId, email });
    if (existing) return res.status(400).json({ message: 'You have already applied for this job.' });

    const resume = req.file ? `/uploads/${req.file.filename}` : null;

    const application = await Application.create({
      job: req.params.jobId,
      name, email, phone, resume, coverLetter,
      linkedin, portfolio, currentCompany,
      currentCTC, expectedCTC, noticePeriod,
    });

    res.status(201).json({ message: 'Application submitted successfully', id: application._id });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
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
