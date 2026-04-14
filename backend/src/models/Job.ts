import mongoose from 'mongoose';

interface IJob {
  _id?: string;
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  recruiter: mongoose.Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}

const jobSchema = new mongoose.Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Please provide a company name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description'],
    },
    requiredSkills: {
      type: [String],
      required: [true, 'Please provide required skills'],
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    } as any,
  },
  { timestamps: true }
);

// Index for fast recruiter lookups (dashboard, job listings)
jobSchema.index({ recruiter: 1 });

export const Job = mongoose.model<IJob>('Job', jobSchema);
