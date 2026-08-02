import mongoose from 'mongoose';

const seekerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
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
