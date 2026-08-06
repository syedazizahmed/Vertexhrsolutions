import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendPasswordResetEmail } from '../utils/mailer.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/forgot-password - request a password reset code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const otp = crypto.randomInt(100000, 1000000).toString();
      user.resetOTP = otp;
      user.resetOTPExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      sendPasswordResetEmail({ to: user.email, name: user.name, otp }).catch((err) => console.error('Failed to send reset email:', err.message));
    }

    res.json({ message: 'If that email is registered, a reset code has been sent.' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/reset-password - confirm OTP and set a new password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid or expired code.' });

    if (!user.resetOTP || !user.resetOTPExpires || user.resetOTPExpires < new Date()) {
      return res.status(400).json({ message: 'This code has expired. Please request a new one.' });
    }
    if (user.resetOTP !== otp) {
      return res.status(400).json({ message: 'Incorrect code. Please try again.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully.' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
