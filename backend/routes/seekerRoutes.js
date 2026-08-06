import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Seeker from '../models/Seeker.js';
import Job from '../models/Job.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/mailer.js';

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id, role: 'seeker' }, process.env.JWT_SECRET, { expiresIn: '7d' });

const issueVerification = async (seeker) => {
  const otp = crypto.randomInt(100000, 1000000).toString();
  seeker.verificationOTP = otp;
  seeker.verificationOTPExpires = new Date(Date.now() + 15 * 60 * 1000);
  await seeker.save();

  await sendVerificationEmail({ to: seeker.email, name: seeker.name, otp });
};

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

    issueVerification(seeker).catch((err) => console.error('Failed to send verification email:', err.message));

    res.status(201).json({ token: signToken(seeker._id), name: seeker.name, email: seeker.email, isVerified: seeker.isVerified });
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

    res.json({ token: signToken(seeker._id), name: seeker.name, email: seeker.email, isVerified: seeker.isVerified });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/seekers/forgot-password - request a password reset code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const seeker = await Seeker.findOne({ email });

    if (seeker) {
      const otp = crypto.randomInt(100000, 1000000).toString();
      seeker.resetOTP = otp;
      seeker.resetOTPExpires = new Date(Date.now() + 15 * 60 * 1000);
      await seeker.save();
      sendPasswordResetEmail({ to: seeker.email, name: seeker.name, otp }).catch((err) => console.error('Failed to send reset email:', err.message));
    }

    res.json({ message: 'If that email is registered, a reset code has been sent.' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/seekers/reset-password - confirm OTP and set a new password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const seeker = await Seeker.findOne({ email });
    if (!seeker) return res.status(400).json({ message: 'Invalid or expired code.' });

    if (!seeker.resetOTP || !seeker.resetOTPExpires || seeker.resetOTPExpires < new Date()) {
      return res.status(400).json({ message: 'This code has expired. Please request a new one.' });
    }
    if (seeker.resetOTP !== otp) {
      return res.status(400).json({ message: 'Incorrect code. Please try again.' });
    }

    seeker.password = await bcrypt.hash(newPassword, 10);
    seeker.resetOTP = undefined;
    seeker.resetOTPExpires = undefined;
    await seeker.save();

    res.json({ message: 'Password reset successfully.' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/seekers/verify-email - confirm email via OTP
router.post('/verify-email', protect, async (req, res) => {
  try {
    const { otp } = req.body;
    const seeker = await Seeker.findById(req.seeker._id);
    if (seeker.isVerified) return res.status(400).json({ message: 'Email is already verified.' });

    if (!seeker.verificationOTP || !seeker.verificationOTPExpires || seeker.verificationOTPExpires < new Date()) {
      return res.status(400).json({ message: 'This code has expired. Please request a new one.' });
    }
    if (seeker.verificationOTP !== otp) {
      return res.status(400).json({ message: 'Incorrect code. Please try again.' });
    }

    seeker.isVerified = true;
    seeker.verificationOTP = undefined;
    seeker.verificationOTPExpires = undefined;
    await seeker.save();

    res.json({ message: 'Email verified successfully.' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/seekers/resend-verification - resend the verification code
router.post('/resend-verification', protect, async (req, res) => {
  try {
    const seeker = await Seeker.findById(req.seeker._id);
    if (seeker.isVerified) return res.status(400).json({ message: 'Email is already verified.' });

    await issueVerification(seeker);
    res.json({ message: 'Verification code sent.' });
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

    res.json({ name: seeker.name, email: seeker.email, isVerified: seeker.isVerified, interestTags, viewedJobs: seeker.viewedJobs });
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
