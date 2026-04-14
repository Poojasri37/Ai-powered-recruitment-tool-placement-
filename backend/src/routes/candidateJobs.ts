import { Router, Request, Response, NextFunction } from 'express';
import { Job } from '../models/Job';
import { Resume } from '../models/Resume';
import { Application } from '../models/Application';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { parseResume } from '../utils/parseResume';
import { calculateMatchScore } from '../utils/matching';
import { calculateAIMatchScore } from '../utils/geminiAI';

interface AuthRequest extends Request {
  userId?: string;
  file?: Express.Multer.File;
}

const router = Router();

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
  const allowedMimes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'Only PDF and DOCX files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') },
});

// Get all jobs (for candidates)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobs = await Job.find().populate('recruiter', 'name email');

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    next(error);
  }
});

// Get job details
router.get('/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.jobId).populate('recruiter', 'name email');

    if (!job) {
      return next(new AppError(404, 'Job not found'));
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
});

// Upload resume and apply to job
router.post(
  '/:jobId/apply',
  authenticateToken,
  upload.single('resume'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return next(new AppError(400, 'Please upload a resume file'));
      }

      const job = await Job.findById(req.params.jobId);
      if (!job) {
        return next(new AppError(404, 'Job not found'));
      }

      // Check if already applied
      const existingApp = await Application.findOne({
        job: req.params.jobId,
        candidate: req.userId,
      });

      if (existingApp) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
        return next(new AppError(400, 'You have already applied to this job'));
      }

      // Parse resume
      const parsedData = await parseResume(req.file.path);

      // Email fallback if parser fails
      if (!parsedData.email) {
        const user = await User.findById(req.userId);
        if (user) {
          parsedData.email = user.email;
        } else {
          parsedData.email = 'unknown@example.com'; // Absolute fallback
        }
      }

      // Calculate match score
      const matchScore = await calculateAIMatchScore(
        parsedData.rawText || JSON.stringify(parsedData),
        job.title,
        job.description,
        job.requiredSkills
      );

      // Create resume document
      const resume = new Resume({
        uploadedBy: req.userId,
        fileName: req.file.originalname,
        filePath: req.file.path,
        ...parsedData,
      });

      await resume.save();

      // Create application
      const application = new Application({
        job: req.params.jobId,
        candidate: req.userId,
        resume: resume._id,
        matchScore,
        status: 'applied',
      });

      await application.save();

      // Populate references
      await application.populate(['job', 'candidate', 'resume']);

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        application,
        matchScore,
      });
    } catch (error) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      next(error);
    }
  }
);

// Get candidate's applications
router.get('/candidate/applications/list', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const applications = await Application.find({ candidate: req.userId })
      .populate('job')
      .populate('resume')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
