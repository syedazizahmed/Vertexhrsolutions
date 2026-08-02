import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    resume: { type: String },
    coverLetter: { type: String },
    linkedin: { type: String },
    portfolio: { type: String },
    currentCompany: { type: String },
    currentCTC: { type: String },
    expectedCTC: { type: String },
    noticePeriod: { type: String },
    status: {
      type: String,
      enum: ['New', 'Reviewed', 'Shortlisted', 'Rejected'],
      default: 'New',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Application', applicationSchema);
