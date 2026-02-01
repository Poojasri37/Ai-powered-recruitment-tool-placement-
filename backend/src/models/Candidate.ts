import mongoose from 'mongoose';

interface ICandidate {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  education: Array<{
    degree: string;
    field: string;
    institution: string;
  }>;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
  }>;
  resumeFile: string;
  job: mongoose.Types.ObjectId | string;
  matchScore?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const candidateSchema = new mongoose.Schema<ICandidate>(
  {
    name: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Candidate email is required'],
      lowercase: true,
    },
    phone: {
      type: String,
    },
    skills: {
      type: [String],
      default: [],
    },
    education: [
      {
        degree: String,
        field: String,
        institution: String,
      },
    ],
    experience: [
      {
        title: String,
        company: String,
        duration: String,
      },
    ],
    resumeFile: {
      type: String,
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    } as any,
    matchScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

export const Candidate = mongoose.model<ICandidate>('Candidate', candidateSchema);
