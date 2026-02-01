import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/candidate-jobs/candidate/applications/list', {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'interview_scheduled':
        return <Clock size={20} className="text-blue-600" />;
      case 'rejected':
        return <AlertCircle size={20} className="text-red-600" />;
      default:
        return <FileText size={20} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'interview_scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-1">Track your job applications and interview status</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <p className="text-gray-600">Loading applications...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No applications yet</p>
            <a
              href="/candidate-jobs"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Browse Jobs
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{app.job.title}</h3>
                    <p className="text-sm text-gray-600">{app.job.recruiter.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 mb-2">
                      {getStatusIcon(app.status)}
                      <span
                        className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {app.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{app.matchScore}%</div>
                    <p className="text-xs text-gray-500">Match Score</p>
                  </div>
                </div>

                {app.status === 'interview_scheduled' && app.interviewDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                    <p className="text-sm font-semibold text-blue-900">Interview Scheduled</p>
                    <p className="text-sm text-blue-800 mb-3">
                      {new Date(app.interviewDate).toLocaleString()}
                    </p>
                    {app.sessionLink && (
                      <button
                        onClick={() => navigate(`/interview/${app.sessionLink.split('/').pop()}`)}
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        <Play size={16} /> Start Interview
                      </button>
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Applied {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
