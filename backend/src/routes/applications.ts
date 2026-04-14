import { Router, Request, Response, NextFunction } from 'express';
import { Application } from '../models/Application';
import { Job } from '../models/Job';
import { authenticateToken } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { 
  sendInterviewScheduledEmail, 
  sendApplicationStatusUpdateEmail 
} from '../utils/emailService';
import { User } from '../models/User';

interface AuthRequest extends Request {
  userId?: string;
}

const router = Router();

// Get dashboard stats (KPIs, Upcoming Interviews, Recent Activity)
router.get('/dashboard-stats', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Get all jobs by this recruiter
    const jobs = await Job.find({ recruiter: req.userId });
    const jobIds = jobs.map(j => j._id);

    // 2. Get all applications for these jobs
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('job', 'title')
      .populate('candidate', 'name')
      .sort({ updatedAt: -1 });

    // 3. Calculate KPIs
    const totalApplications = applications.length;
    const interviewsScheduled = applications.filter(a => a.status === 'interview_scheduled').length;
    const hired = applications.filter(a => a.status === 'accepted').length;

    // 4. Get Upcoming Interviews (status 'interview_scheduled' and date >= now)
    const now = new Date();
    const upcomingInterviews = applications
      .filter(a => a.status === 'interview_scheduled' && a.interviewDate && new Date(a.interviewDate) >= now)
      .sort((a, b) => new Date(a.interviewDate!).getTime() - new Date(b.interviewDate!).getTime())
      .slice(0, 5) // Limit to 5
      .map(a => ({
        id: a._id,
        candidateName: (a.candidate as any)?.name || 'Unknown',
        jobTitle: (a.job as any)?.title || 'Unknown',
        date: a.interviewDate,
        status: a.status
      }));

    // 5. Get Recent Activity (latest 5 updates)
    // We'll use the sorted applications list we already have
    const recentActivity = applications.slice(0, 5).map(a => {
      let type = 'apply';
      let text = `New application for ${(a.job as any)?.title}`;
      let color = 'text-purple-600';
      let bg = 'bg-purple-100';

      if (a.status === 'interview_scheduled') {
        type = 'interview';
        text = `Interview scheduled with ${(a.candidate as any)?.name}`;
        color = 'text-blue-600';
        bg = 'bg-blue-100';
      } else if (a.status === 'accepted') {
        type = 'status';
        text = `${(a.candidate as any)?.name} hired for ${(a.job as any)?.title}`;
        color = 'text-green-600';
        bg = 'bg-green-100';
      } else if (a.status === 'rejected') {
        type = 'status';
        text = `${(a.candidate as any)?.name} rejected`;
        color = 'text-red-600';
        bg = 'bg-red-100';
      } else if (a.status === 'reviewing') {
        type = 'review';
        text = `Reviewing ${(a.candidate as any)?.name}'s application`;
        color = 'text-orange-600';
        bg = 'bg-orange-100';
      }

      return {
        id: a._id,
        type,
        text,
        time: new Date(a.updatedAt || new Date()).toLocaleDateString(), // Simplification, frontend can format relative time
        timestamp: a.updatedAt || new Date(), // Pass raw timestamp for frontend to format "X mins ago"
        color,
        bg
      };
    });

    res.status(200).json({
      success: true,
      stats: {
        totalApplications,
        interviewsScheduled,
        hired
      },
      upcomingInterviews,
      recentActivity
    });

  } catch (error) {
    next(error);
  }
});

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

    // Send status update email
    try {
      if (application.candidate && application.job) {
        const message = notes || `Your application status for ${(application.job as any).title} has been updated to ${status.replace('_', ' ')}.`;
        await sendApplicationStatusUpdateEmail(
          (application.candidate as any).name,
          (application.candidate as any).email,
          (application.job as any).title,
          status,
          message
        );
      }
    } catch (emailErr) {
      console.error('Failed to send status update email:', emailErr);
    }

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

    // Send email notification to candidate
    try {
      const recruiter = await User.findById(req.userId);
      if (recruiter && application.candidate && application.job) {
        await sendInterviewScheduledEmail(
          (application.candidate as any).name,
          (application.candidate as any).email,
          (application.job as any).title,
          application.interviewDate!,
          application.interviewLink!,
          recruiter.name
        );
      }
    } catch (emailErr) {
      console.error('Failed to send interview email:', emailErr);
      // Don't fail the request if email fails
    }

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
