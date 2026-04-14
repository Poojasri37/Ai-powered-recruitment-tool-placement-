import mongoose from 'mongoose';

interface IResume {
  _id?: string;
  uploadedBy: mongoose.Types.ObjectId | string;
  fileName: string;
  filePath: string;
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
  rawText?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const resumeSchema = new mongoose.Schema<IResume>(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    } as any,
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
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
    rawText: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Resume = mongoose.model<IResume>('Resume', resumeSchema);
