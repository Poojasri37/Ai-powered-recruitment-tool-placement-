import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ApplicationTimeline } from '../components/candidate/ApplicationTimeline';
import { NotificationPanel } from '../components/candidate/NotificationPanel';
import { InterviewCountdown } from '../components/candidate/InterviewCountdown';
import { PerformanceReviewCard } from '../components/candidate/PerformanceReviewCard';
import { API_URL } from '../config';
import { getAuthToken } from '../utils/auth';

interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    recruiter: {
      name: string;
    };
  };
  matchScore: number;
  status: 'applied' | 'reviewing' | 'interview_scheduled' | 'rejected' | 'accepted';
  interviewDate?: string;
  sessionLink?: string;
  interviewSessionId?: string;
  interviewResults?: any; // Mock logic for now
  createdAt: string;
}

export const CandidateDashboardPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/candidate-jobs/candidate/applications/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch applications');

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Find next upcoming interview
  const upcomingInterview = applications.find(app =>
    app.status === 'interview_scheduled' &&
    app.interviewDate &&
    new Date(app.interviewDate) > new Date()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationPanel applications={applications} />

      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 bg-opacity-90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Overview</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {upcomingInterview && upcomingInterview.interviewDate && (
          <InterviewCountdown
            interviewDate={upcomingInterview.interviewDate}
            onJoin={() => navigate(`/interview/${upcomingInterview.sessionLink?.split('/').pop()}`)}
          />
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <FileText size={40} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No applications yet</h3>
            <a href="/candidate-jobs" className="text-blue-600 font-bold hover:underline">Browse Open Jobs</a>
          </div>
        ) : (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-800">My Applications</h2>

            <div className="grid gap-6">
              {applications.map((app) => (
                <div key={app._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{app.job.title}</h3>
                      <p className="text-sm text-gray-500">{app.job.recruiter.name} • Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Timeline Visual */}
                  <div className="mb-8">
                    <ApplicationTimeline status={app.status} />
                  </div>

                  {/* Interview Action */}
                  {app.status === 'interview_scheduled' && app.interviewDate && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="text-blue-600" />
                        <div>
                          <p className="font-bold text-blue-900 text-sm">Action Required</p>
                          <p className="text-xs text-blue-700">Interview scheduled for {new Date(app.interviewDate).toLocaleString()}</p>
                        </div>
                      </div>
                      {app.sessionLink && (
                        <button onClick={() => navigate(`/interview/${app.sessionLink?.split('/').pop()}`)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow transition">
                          Join Room
                        </button>
                      )}
                    </div>
                  )}

                  {/* Results / Feedback */}
                  {app.status === 'accepted' || app.status === 'rejected' ? (
                    <div className="mt-6">
                      {/* Mocking results if not present for demo */}
                      <PerformanceReviewCard results={app.interviewResults || {
                        technicalScore: app.matchScore,
                        communicationScore: 85,
                        cultureFitScore: 90,
                        problemSolvingScore: 78,
                        feedback: "Strong technical skills demonstrated. Good culture fit."
                      }} />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
