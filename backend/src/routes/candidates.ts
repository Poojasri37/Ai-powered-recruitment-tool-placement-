import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Candidate } from '../models/Candidate';
import { Job } from '../models/Job';
import { authenticateToken } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { parseResume } from '../utils/parseResume';
import { calculateMatchScore } from '../utils/matching';
import { matchResumeToJobs, calculateAIMatchScore } from '../utils/geminiAI';
import { User } from '../models/User';
import xlsx from 'xlsx';

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

// Upload resume
router.post(
  '/upload',
  authenticateToken,
  upload.single('resume'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return next(new AppError(400, 'Please upload a resume file'));
      }

      const { jobId } = req.body;

      let jobVal = null;
      let matchScore = 0;

      // If jobId is provided, validate it and calculate score
      if (jobId) {
        const job = await Job.findById(jobId);
        if (!job) {
          return next(new AppError(404, 'Job not found'));
        }
        jobVal = jobId;
        // Parse resume first to get skills
        const parsedData = await parseResume(req.file.path);
        
        // Email fallback if parser fails
        if (!parsedData.email) {
          const user = await User.findById(req.userId);
          if (user) {
            parsedData.email = user.email;
          } else {
            parsedData.email = 'candidate-upload@example.com';
          }
        }

        matchScore = await calculateAIMatchScore(
          parsedData.rawText || JSON.stringify(parsedData),
          job.title,
          job.description,
          job.requiredSkills
        );

        // Create candidate with job linkage
        const candidate = new Candidate({
          ...parsedData,
          resumeFile: req.file.path,
          job: jobVal,
          matchScore,
        });
        await candidate.save();

        return res.status(201).json({
          success: true,
          message: 'Resume uploaded and application submitted',
          candidate,
        });
      }

      // If no jobId (Talent Pool / General Upload), just parse and save
      const parsedData = await parseResume(req.file.path);

      // Email fallback if parser fails
      if (!parsedData.email) {
        const user = await User.findById(req.userId);
        if (user) {
          parsedData.email = user.email;
        } else {
          parsedData.email = 'talent-pool@example.com';
        }
      }

      const candidate = new Candidate({
        ...parsedData,
        resumeFile: req.file.path,
        matchScore: 0, // No specific job to match against yet
        // job field is undefined/null
      });
      await candidate.save();

      res.status(201).json({
        success: true,
        message: 'Resume uploaded to Talent Pool',
        candidate,
      });
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      next(error);
    }
  }
);

// Bulk upload students/candidates (Placement Side)
// Accepts excel or csv
const bulkUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.post('/bulk', authenticateToken, bulkUpload.single('file'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new AppError(400, 'Please upload an excel/csv file'));
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[] = xlsx.utils.sheet_to_json(sheet);

    if (!data || data.length === 0) {
      return next(new AppError(400, 'File is empty or invalid format'));
    }

    let successCount = 0;
    let failCount = 0;

    for (const row of data) {
      const email = row.email || row.Email;
      const name = row.name || row.Name;
      const dept = row.department || row.Department || '';
      const password = row.password || row.Password;

      if (!email || !name || !password) {
        failCount++;
        continue;
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        failCount++;
        continue;
      }

      try {
        await User.create({
          name,
          email,
          password,
          role: 'candidate',
          // Note: if User schema doesn't have department, we can't store it unless we update the schema.
          // We'll trust name, email, password for now.
        });
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk import finished`,
      count: successCount,
      failed: failCount
    });
  } catch (error) {
    next(error);
  }
});

// Match resume to jobs
router.post(
  '/match-jobs',
  authenticateToken,
  upload.single('resume'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return next(new AppError(400, 'Please upload a resume file'));
      }

      // 1. Parse Resume
      const parsedData = await parseResume(req.file.path);

      // 2. Fetch all active jobs (or top 20 latest)
      const jobs = await Job.find().sort({ createdAt: -1 }).limit(20);

      // 3. AI Matching
      const matches = await matchResumeToJobs(
        JSON.stringify({
          skills: parsedData.skills,
          experience: parsedData.experience,
          education: parsedData.education
        }),
        jobs.map(j => ({
          _id: j._id.toString(),
          title: j.title,
          description: j.description,
          requiredSkills: j.requiredSkills
        }))
      );

      // 4. Enrich response with Job details using the matches
      const enrichedMatches = matches.map(match => {
        const job = jobs.find(j => j._id.toString() === match.jobId);
        return {
          ...match,
          jobTitle: job?.title || 'Unknown Job',
          company: job?.company || 'RecruitAI Client',
        };
      });

      // Cleanup file after processing? 
      // User might want to save it to talent pool too, but for this specific endpoint we just return matches.
      // We'll delete it to keep storage clean unless we want to autosave.
      // For now, let's keep it simple and just return matches.
      fs.unlink(req.file.path, (err) => { if (err) console.error(err); });

      res.status(200).json({
        success: true,
        candidateName: parsedData.name,
        matches: enrichedMatches
      });

    } catch (error) {
      if (req.file) fs.unlink(req.file.path, () => { });
      next(error);
    }
  }
);

// Get candidates for a job
router.get('/:jobId', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return next(new AppError(404, 'Job not found'));
    }

    // Security Check: Ensure recruiter owns this job
    if (job.recruiter.toString() !== req.userId) {
      return next(new AppError(403, 'Not authorized to view candidates for this job'));
    }

    const candidates = await Candidate.find({ job: req.params.jobId }).sort({
      matchScore: -1,
    });

    const totalCandidates = candidates.length;
    const avgScore =
      candidates.length > 0
        ? Math.round(
          candidates.reduce((sum, c) => sum + (c.matchScore || 0), 0) / candidates.length
        )
        : 0;
    const topCandidates = candidates.slice(0, 3);

    res.status(200).json({
      success: true,
      totalCandidates,
      averageScore: avgScore,
      topCandidates,
      allCandidates: candidates,
    });
  } catch (error) {
    next(error);
  }
});

// Get single candidate
router.get('/detail/:id', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('job');

    if (!candidate) {
      return next(new AppError(404, 'Candidate not found'));
    }

    // Security Check: Ensure recruiter owns the job associated with this candidate
    // If candidate has no job (talent pool), we might need different logic, but assuming job linkage for now
    if (candidate.job) {
      const job = await Job.findById((candidate.job as any)._id);
      if (job && job.recruiter.toString() !== req.userId) {
        return next(new AppError(403, 'Not authorized to view this candidate'));
      }
    }

    res.status(200).json({
      success: true,
      candidate,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
