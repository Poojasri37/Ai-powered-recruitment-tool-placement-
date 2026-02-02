import { Router, Request, Response, NextFunction } from 'express';
import { Job } from '../models/Job';
import { authenticateToken } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

interface AuthRequest extends Request {
  userId?: string;
}

const router = Router();

// Create job
router.post('/', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, requiredSkills } = req.body;

    if (!title || !description || !requiredSkills) {
      return next(new AppError(400, 'Please provide all required fields'));
    }

    const job = new Job({
      title,
      description,
      requiredSkills,
      recruiter: req.userId,
    });

    await job.save();

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job,
    });
  } catch (error) {
    next(error);
  }
});

// Get all jobs for the authenticated recruiter
router.get('/', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const jobs = await Job.find({ recruiter: req.userId }).populate('recruiter', 'name email');

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    next(error);
  }
});

// Get job by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name email');

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

// Update job
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError(404, 'Job not found'));
    }

    if (job.recruiter.toString() !== req.userId) {
      return next(new AppError(403, 'Not authorized to update this job'));
    }

    const { title, description, requiredSkills } = req.body;
    if (title) job.title = title;
    if (description) job.description = description;
    if (requiredSkills) job.requiredSkills = requiredSkills;

    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      job,
    });
  } catch (error) {
    next(error);
  }
});

// Delete job
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError(404, 'Job not found'));
    }

    if (job.recruiter.toString() !== req.userId) {
      return next(new AppError(403, 'Not authorized to delete this job'));
    }

    await Job.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
