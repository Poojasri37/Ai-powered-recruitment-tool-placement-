import mongoose from 'mongoose';

interface IJob {
  _id?: string;
  title: string;
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

export const Job = mongoose.model<IJob>('Job', jobSchema);
