import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: String, required: true },
    companyLogo: { type: String },
    location: { type: String, required: true },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
      required: true,
    },
    salary: { type: String },
    experience: {
      type: String,
      enum: ['Fresher', '1-2 years', '3-5 years', '5-10 years', '10+ years'],
    },
    qualification: { type: String },
    tags: [{ type: String }],
    applyLink: { type: String },
    coverImage: { type: String },
    deadline: { type: Date },
    isActive: { type: Boolean, default: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', company: 'text' });

export default mongoose.model('Job', jobSchema);
