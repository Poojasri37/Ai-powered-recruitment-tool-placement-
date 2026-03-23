import { Router, Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Application } from '../models/Application';
import InterviewSession from '../models/InterviewSession';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get detailed analysis reports of all students for the placement team
router.get('/students', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Get all students (role: candidate)
    const candidates = await User.find({ role: 'candidate' }).select('name email');

    const reportsData = [];

    // 2. Fetch stats for each candidate
    for (const candidate of candidates) {
      // Get total applications
      const applicationsCount = await Application.countDocuments({ candidate: candidate._id });

      // Get interview sessions
      const sessions = await InterviewSession.find({ candidateId: candidate._id });

      const completedSessions = sessions.filter(s => s.status === 'completed');
      
      let totalScore = 0;
      let scoredCount = 0;
      
      completedSessions.forEach(session => {
        if (session.interviewResults && session.interviewResults.score != null) {
          totalScore += session.interviewResults.score;
          scoredCount++;
        }
      });

      const averageScore = scoredCount > 0 ? totalScore / scoredCount : 0;
      
      // Sort sessions by updated at or scheduled time to get the most recent one
      const sortedCompletedSessions = completedSessions.sort(
        (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
      );
      
      const recentSessionId = sortedCompletedSessions.length > 0 ? sortedCompletedSessions[0]._id : null;

      reportsData.push({
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        applications: applicationsCount,
        interviewsCompleted: completedSessions.length,
        averageScore,
        recentInterviewResultId: recentSessionId
      });
    }

    res.status(200).json({
      success: true,
      data: reportsData
    });

  } catch (error) {
    next(error);
  }
});

export default router;
