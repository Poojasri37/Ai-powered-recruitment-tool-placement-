import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import { Resume } from '../models/Resume';
import { Job } from '../models/Job';
import { parseResume } from '../utils/parseResume';
import { generateInterviewQuestions, generateMockInterviewReport, calculateAIMatchScore } from '../utils/geminiAI';
import multer from 'multer';
import fs from 'fs';

interface AuthRequest extends Request {
  userId?: string;
  file?: Express.Multer.File;  
}

const router = Router();

// Configure multer for resume upload
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `mock-${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and DOCX files are allowed') as any);
  },
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') },
});

// @route POST /api/mock-interview/upload-resume
// @desc  Upload resume and get matched jobs
router.post('/upload-resume', upload.single('resume'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Please upload a resume file' });
      return;
    }

    // Parse resume
    const parsedData = await parseResume(req.file.path);

    // Save resume
    const resume = new Resume({
      uploadedBy: req.userId,
      fileName: req.file.originalname,
      filePath: req.file.path,
      ...parsedData,
    });
    await resume.save();

    // Get all jobs and calculate AI match scores
    const jobs = await Job.find().populate('recruiter', 'name email');
    
    const matchedJobs = [];
    for (const job of jobs) {
      const score = await calculateAIMatchScore(
        parsedData.rawText || JSON.stringify(parsedData),
        job.title,
        job.description,
        job.requiredSkills
      );
      if (score > 20) { // Only show jobs with > 20% match
        matchedJobs.push({
          _id: job._id,
          title: job.title,
          description: job.description,
          requiredSkills: job.requiredSkills,
          recruiter: job.recruiter,
          matchScore: score,
        });
      }
    }

    // Sort by score descending
    matchedJobs.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      resumeId: resume._id,
      resumeText: parsedData.rawText || JSON.stringify(parsedData),
      parsedData: {
        name: parsedData.name,
        email: parsedData.email,
        skills: parsedData.skills,
      },
      matchedJobs,
    });
  } catch (error) {
    next(error);
  }
});

// @route POST /api/mock-interview/generate-questions
// @desc  Generate mock interview questions from resume + optional job context
router.post('/generate-questions', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { resumeText, jobTitle, jobDescription, requiredSkills } = req.body;

    if (!resumeText) {
      res.status(400).json({ error: 'Resume text is required' });
      return;
    }

    const title = jobTitle || 'General Software Role';
    const description = jobDescription || 'A general software development position';
    const skills = requiredSkills || ['Programming', 'Problem Solving'];

    const questions = await generateInterviewQuestions(title, description, skills, resumeText);

    res.status(200).json({
      success: true,
      questions,
    });
  } catch (error) {
    next(error);
  }
});

// @route POST /api/mock-interview/analyze
// @desc  Analyze mock interview answers and generate detailed report
router.post('/analyze', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { responses, resumeText } = req.body;

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      res.status(400).json({ error: 'Interview responses are required' });
      return;
    }

    const report = await generateMockInterviewReport(responses, resumeText || '');

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
