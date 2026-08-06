import mongoose from 'mongoose';

const seekerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationOTP: { type: String },
    verificationOTPExpires: { type: Date },
    resetOTP: { type: String },
    resetOTPExpires: { type: Date },
    viewedJobs: [
      {
        job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  },
  { timestamps: true }
);

export default mongoose.model('Seeker', seekerSchema);
