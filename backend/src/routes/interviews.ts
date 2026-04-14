import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import InterviewSession from '../models/InterviewSession';
import { Application } from '../models/Application';
import { User } from '../models/User';
import { Job } from '../models/Job';
import { v4 as uuidv4 } from 'uuid';
import {
  evaluateInterviewResponse,
  generateInterviewSummary,
  generateInterviewQuestions,
  generateFollowUpQuestion
} from '../utils/geminiAI';
import { sendInterviewScheduledEmail } from '../utils/emailService';

const router = Router();

// @route   GET /api/interviews/questions/:jobId
// @desc    Generate interview questions using Gemini
// @access  Private (candidate)
router.get('/questions/:jobId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;

    // const Job = require('../models/Job').default; // Removed incorrect require
    const job = await Job.findById(jobId);

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const questions = await generateInterviewQuestions(
      job.title,
      job.description,
      job.requiredSkills
    );

    res.status(200).json({
      success: true,
      data: { questions },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/interviews/questions-by-session/:sessionId
// @desc    Generate personalized interview questions using candidate's resume
router.get('/questions-by-session/:sessionId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const session = await InterviewSession.findOne({ sessionLink: `/interview/${sessionId}` })
      .populate('jobId')
      .populate('resumeId');

    if (!session || !session.jobId || !session.resumeId) {
      return next(new Error('Session, job, or resume data not found'));
    }

    const job = session.jobId as any;
    const resume = session.resumeId as any;
    // Build resume context: prefer rawText, fallback to structured fields
    let resumeContext = resume.rawText || '';
    if (!resumeContext) {
      const parts: string[] = [];
      if (resume.name) parts.push(`Name: ${resume.name}`);
      if (resume.skills?.length) parts.push(`Skills: ${resume.skills.join(', ')}`);
      if (resume.experience?.length) {
        parts.push('Experience: ' + resume.experience.map((e: any) => `${e.title} at ${e.company} (${e.duration})`).join('; '));
      }
      if (resume.education?.length) {
        parts.push('Education: ' + resume.education.map((e: any) => `${e.degree} in ${e.field} from ${e.institution}`).join('; '));
      }
      resumeContext = parts.join('\n') || JSON.stringify(resume);
    }

    const questions = await generateInterviewQuestions(
      job.title,
      job.description,
      job.requiredSkills,
      resumeContext
    );

    res.status(200).json({
      success: true,
      data: { questions },
    });
  } catch(error) {
    next(error);
  }
});

// @route   POST /api/interviews/follow-up
// @desc    Generate a follow-up question
router.post('/follow-up', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { previousQuestion, candidateAnswer } = req.body;
    if (!previousQuestion || !candidateAnswer) {
      res.status(400).json({ error: 'Missing parameters' });
      return;
    }
    const followUp = await generateFollowUpQuestion(previousQuestion, candidateAnswer);
    res.status(200).json({ success: true, followUp });
  } catch(err) {
    next(err);
  }
});

// @route   POST /api/interviews/schedule
// @desc    Create a new interview session
// @access  Private (recruiter only)
router.post('/schedule', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { applicationId, scheduledTime } = req.body;

    if (!applicationId || !scheduledTime) {
      res.status(400).json({ error: 'Please provide applicationId and scheduledTime' });
      return;
    }

    // Verify application exists and get details
    const application = await Application.findById(applicationId)
      .populate('job')
      .populate('candidate')
      .populate('resume');

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    // Verify recruiter owns this job
    const job = (application.job as any);
    if (job.recruiter.toString() !== userId) {
      res.status(403).json({ error: 'Not authorized to schedule interviews for this job' });
      return;
    }

    // Generate unique session link
    const sessionId = uuidv4();
    const sessionLink = `/interview/${sessionId}`;

    // Create interview session - ensure application is not null
    const candidateId = (application.candidate as any)._id || application.candidate;
    const jobId = (application.job as any)._id || application.job;
    const resumeId = (application.resume as any)._id || application.resume;

    const interviewSession = new InterviewSession({
      applicationId,
      candidateId,
      jobId,
      resumeId,
      scheduledTime: new Date(scheduledTime),
      sessionLink,
      status: 'scheduled',
      notes: req.body.notes || '',
    });

    await interviewSession.save();

    // Update application with session link and status
    application.sessionLink = sessionLink;
    application.interviewSessionId = interviewSession._id;
    application.status = 'interview_scheduled';
    application.interviewDate = new Date(scheduledTime);
    await application.save();

    res.status(201).json({
      success: true,
      message: 'Interview session scheduled successfully',
      data: {
        sessionId,
        sessionLink,
        scheduledTime,
        candidateName: (application.candidate as any).name,
        candidateEmail: (application.candidate as any).email,
      },
    });

    // Send email to candidate asynchronously (don't wait for it)
    const recruiter = await User.findById(job.recruiter);
    if (recruiter) {
      sendInterviewScheduledEmail(
        (application.candidate as any).name,
        (application.candidate as any).email,
        job.title,
        new Date(scheduledTime),
        sessionLink,
        recruiter.name
      ).catch((err) => console.error('Failed to send interview email:', err));
    }
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/interviews/:sessionId
// @desc    Get interview session metadata
// @access  Private (candidate or recruiter)
router.get('/:sessionId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;

    const interviewSession = await InterviewSession.findOne({
      sessionLink: `/interview/${sessionId}`,
    })
      .populate('applicationId')
      .populate('candidateId')
      .populate('jobId')
      .populate('resumeId');

    if (!interviewSession) {
      res.status(404).json({ error: 'Interview session not found' });
      return;
    }

    // Check if user is the candidate or recruiter of this session
    const userId = (req as any).userId;
    const application = interviewSession.applicationId as any;

    if (interviewSession.candidateId._id.toString() !== userId && application.job.recruiter.toString() !== userId) {
      res.status(403).json({ error: 'Unauthorized to access this session' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId,
        sessionLink: interviewSession.sessionLink,
        scheduledTime: interviewSession.scheduledTime,
        status: interviewSession.status,
        candidate: {
          id: (interviewSession.candidateId as any)._id,
          name: (interviewSession.candidateId as any).name,
          email: (interviewSession.candidateId as any).email,
        },
        job: {
          id: (interviewSession.jobId as any)._id,
          title: (interviewSession.jobId as any).title,
          description: (interviewSession.jobId as any).description,
          requiredSkills: (interviewSession.jobId as any).requiredSkills,
        },
        resume: {
          id: (interviewSession.resumeId as any)._id,
          fileName: (interviewSession.resumeId as any).fileName,
          parsedData: (interviewSession.resumeId as any).parsedData,
        },
        interviewResults: interviewSession.interviewResults || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/interviews/:sessionId/start
// @desc    Mark interview as in progress
// @access  Private (candidate)
router.put('/:sessionId/start', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;

    const interviewSession = await InterviewSession.findOne({
      sessionLink: `/interview/${sessionId}`,
    });

    if (!interviewSession) {
      res.status(404).json({ error: 'Interview session not found' });
      return;
    }

    // Verify this is the candidate
    const userId = (req as any).userId;
    if (interviewSession.candidateId.toString() !== userId) {
      res.status(403).json({ error: 'Only the candidate can start this interview' });
      return;
    }

    interviewSession.status = 'in_progress';
    await interviewSession.save();

    res.status(200).json({
      success: true,
      message: 'Interview started',
      data: { status: interviewSession.status },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/interviews/:sessionId/submit
// @desc    Submit interview results
// @access  Private (candidate)
router.put('/:sessionId/submit', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const { score, summary, responses, codeSubmissions, transcript, duration } = req.body;

    const interviewSession = await InterviewSession.findOne({
      sessionLink: `/interview/${sessionId}`,
    })
      .populate('jobId')
      .populate('resumeId');

    if (!interviewSession) {
      res.status(404).json({ error: 'Interview session not found' });
      return;
    }

    // Verify this is the candidate
    const userId = (req as any).userId;
    if (interviewSession.candidateId.toString() !== userId) {
      res.status(403).json({ error: 'Only the candidate can submit results' });
      return;
    }

    // Use Gemini to evaluate responses with per-question scores
    const job = interviewSession.jobId as any;
    let evaluatedResponses = responses;

    try {
      // Process evaluations sequentially to avoid overwhelming the AI queue
      // The aiQueue handles concurrency limits and rate-limit retries internally
      evaluatedResponses = [];
      for (const r of responses) {
        try {
          const result = await evaluateInterviewResponse(
            r.question,
            r.answer,
            r.type,
            job.description,
            job.requiredSkills
          );
          evaluatedResponses.push({
            ...r,
            aiEvaluation: result.evaluation,
            score: result.score,
          });
        } catch (singleEvalError) {
          console.error('Error evaluating single response:', singleEvalError);
          evaluatedResponses.push({
            ...r,
            aiEvaluation: 'Evaluation pending - will be reviewed manually',
            score: 0,
          });
        }
      }
    } catch (evalError) {
      console.error('Error during AI evaluation:', evalError);
      // Continue with empty evaluations if AI fails
      evaluatedResponses = responses.map((r: any) => ({
        ...r,
        aiEvaluation: 'Evaluation pending',
        score: 0,
      }));
    }

    // Calculate overall score as a normalized percentage out of 100
    const totalScore = evaluatedResponses.reduce((acc: number, r: any) => acc + (r.score || 0), 0);
    const maxPossibleScore = evaluatedResponses.length * 10;
    const calculatedScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    // Generate interview summary using Gemini
    let aiSummary = summary;
    try {
      aiSummary = await generateInterviewSummary(evaluatedResponses, job.title, job.requiredSkills);
    } catch (summaryError) {
      console.error('Error generating summary:', summaryError);
    }

    // Store results with correctly calculated score
    interviewSession.interviewResults = {
      score: calculatedScore,
      summary: aiSummary,
      responses: evaluatedResponses,
      codeSubmissions,
      transcript,
      duration,
    };
    interviewSession.status = 'completed';
    await interviewSession.save();

    // Update application with results
    const application = await Application.findById(interviewSession.applicationId);
    if (application) {
      application.interviewResults = {
        score: calculatedScore,
        summary: aiSummary,
        timestamp: new Date(),
      };
      // application.status = 'accepted'; // Removed auto-hire, let HR decide
      await application.save();
    }

    res.status(200).json({
      success: true,
      message: 'Interview results submitted successfully',
      data: { status: interviewSession.status, score: calculatedScore, summary: aiSummary },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/interviews/results/:sessionId
// @desc    Get interview results (recruiter view)
// @access  Private (recruiter)
router.get('/results/:sessionId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;

    // Try to find by sessionLink first, then by MongoDB _id
    let interviewSession = await InterviewSession.findOne({
      sessionLink: `/interview/${sessionId}`,
    })
      .populate('applicationId')
      .populate('candidateId')
      .populate('jobId')
      .populate('resumeId');

    if (!interviewSession) {
      // Fallback: try finding by MongoDB ObjectId (used by Reports page)
      try {
        interviewSession = await InterviewSession.findById(sessionId)
          .populate('applicationId')
          .populate('candidateId')
          .populate('jobId')
          .populate('resumeId');
      } catch (e) {
        // Invalid ObjectId format, ignore
      }
    }

    if (!interviewSession) {
      res.status(404).json({ error: 'Interview session not found' });
      return;
    }

    if (!interviewSession.interviewResults) {
      res.status(400).json({ error: 'Interview not completed yet' });
      return;
    }

    // Verify user is recruiter for this job
    const userId = (req as any).userId;

    res.status(200).json({
      success: true,
      data: {
        sessionId,
        candidateName: (interviewSession.candidateId as any).name,
        jobTitle: (interviewSession.jobId as any).title,
        results: interviewSession.interviewResults,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
