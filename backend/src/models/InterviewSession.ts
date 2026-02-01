import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewSession extends Document {
  applicationId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  scheduledTime: Date;
  sessionLink: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  interviewResults?: {
    score: number;
    summary: string;
    responses: Array<{
      question: string;
      answer: string;
      type: 'behavioral' | 'technical' | 'coding';
      aiEvaluation: string;
    }>;
    codeSubmissions: Array<{
      language: string;
      code: string;
      output: string;
    }>;
    transcript: string;
    duration: number; // in seconds
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const interviewSessionSchema = new Schema(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    scheduledTime: {
      type: Date,
      required: true,
    },
    sessionLink: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    interviewResults: {
      score: Number,
      summary: String,
      responses: [
        {
          question: String,
          answer: String,
          type: { type: String, enum: ['behavioral', 'technical', 'coding', 'situational'] },
          aiEvaluation: String,
        },
      ],
      codeSubmissions: [
        {
          language: String,
          code: String,
          output: String,
        },
      ],
      transcript: String,
      duration: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IInterviewSession>(
  'InterviewSession',
  interviewSessionSchema
);
