import { Router, Request, Response, NextFunction } from 'express';
import { Application } from '../models/Application';
import { Job } from '../models/Job';
import { authenticateToken } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

interface AuthRequest extends Request {
  userId?: string;
}

const router = Router();

// Get all applications for a recruiter's jobs
router.get('/recruiter/all', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get all jobs created by this recruiter
    const jobs = await Job.find({ recruiter: req.userId });
    const jobIds = jobs.map((job) => job._id);

    // Get applications for these jobs
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('job')
      .populate('candidate', 'name email')
      .populate('resume')
      .sort({ createdAt: -1 });

    const stats = {
      total: applications.length,
      applied: applications.filter((a) => a.status === 'applied').length,
      reviewing: applications.filter((a) => a.status === 'reviewing').length,
      interview_scheduled: applications.filter((a) => a.status === 'interview_scheduled').length,
      accepted: applications.filter((a) => a.status === 'accepted').length,
      rejected: applications.filter((a) => a.status === 'rejected').length,
    };

    res.status(200).json({
      success: true,
      stats,
      applications,
    });
  } catch (error) {
    next(error);
  }
});

// Get applications for a specific job
router.get('/job/:jobId', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return next(new AppError(404, 'Job not found'));
    }

    if (job.recruiter.toString() !== req.userId) {
      return next(new AppError(403, 'Not authorized to view these applications'));
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email')
      .populate('resume')
      .sort({ matchScore: -1 });

    const avgScore =
      applications.length > 0
        ? Math.round(applications.reduce((sum, a) => sum + a.matchScore, 0) / applications.length)
        : 0;

    const topApplications = applications.slice(0, 3);

    res.status(200).json({
      success: true,
      totalApplications: applications.length,
      averageScore: avgScore,
      topApplications,
      allApplications: applications,
    });
  } catch (error) {
    next(error);
  }
});

// Update application status
router.put('/:appId/status', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, notes } = req.body;

    const application = await Application.findById(req.params.appId).populate('job');

    if (!application) {
      return next(new AppError(404, 'Application not found'));
    }

    const job = await Job.findById((application.job as any)._id);
    if (job && job.recruiter.toString() !== req.userId) {
      return next(new AppError(403, 'Not authorized to update this application'));
    }

    application.status = status;
    if (notes) application.notes = notes;

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application status updated',
      application,
    });
  } catch (error) {
    next(error);
  }
});

// Schedule interview
router.post('/:appId/schedule-interview', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { interviewDate, interviewLink } = req.body;

    if (!interviewDate) {
      return next(new AppError(400, 'Interview date is required'));
    }

    const application = await Application.findById(req.params.appId).populate('job');

    if (!application) {
      return next(new AppError(404, 'Application not found'));
    }

    const job = await Job.findById((application.job as any)._id);
    if (job && job.recruiter.toString() !== req.userId) {
      return next(new AppError(403, 'Not authorized to schedule this interview'));
    }

    application.interviewDate = new Date(interviewDate);
    application.interviewLink = interviewLink || `https://meet.google.com/new`;
    application.status = 'interview_scheduled';

    await application.save();

    // TODO: Send email notification to candidate
    // TODO: Create Google Calendar event

    res.status(200).json({
      success: true,
      message: 'Interview scheduled successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
});

// Get single application details
router.get('/detail/:appId', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const application = await Application.findById(req.params.appId)
      .populate('job')
      .populate('candidate', 'name email phone')
      .populate('resume');

    if (!application) {
      return next(new AppError(404, 'Application not found'));
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
