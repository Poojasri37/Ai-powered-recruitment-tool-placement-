import mongoose from 'mongoose';

interface IApplication {
  _id?: string;
  job: mongoose.Types.ObjectId | string;
  candidate: mongoose.Types.ObjectId | string;
  resume: mongoose.Types.ObjectId | string;
  matchScore: number;
  status: 'applied' | 'reviewing' | 'interview_scheduled' | 'rejected' | 'accepted';
  interviewDate?: Date;
  interviewLink?: string;
  sessionLink?: string;
  interviewSessionId?: mongoose.Types.ObjectId | string;
  interviewResults?: {
    score: number;
    summary: string;
    timestamp: Date;
  };
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const applicationSchema = new mongoose.Schema<IApplication>(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    } as any,
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    } as any,
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    } as any,
    matchScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'interview_scheduled', 'rejected', 'accepted'],
      default: 'applied',
    },
    interviewDate: {
      type: Date,
    },
    interviewLink: {
      type: String,
    },
    sessionLink: {
      type: String,
    },
    interviewSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewSession',
    } as any,
    interviewResults: {
      score: Number,
      summary: String,
      timestamp: Date,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Application = mongoose.model<IApplication>('Application', applicationSchema);
