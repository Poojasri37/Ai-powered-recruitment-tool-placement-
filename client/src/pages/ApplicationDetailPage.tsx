import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Mail, Phone, Download, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ApplicationDetail {
  _id: string;
  candidate: {
    _id?: string;
    name: string;
    email: string;
    phone?: string;
  };
  job: {
    _id?: string;
    title: string;
  };
  resume: {
    _id?: string;
    skills: string[];
    education: any[];
    experience: any[];
    filePath: string;
  };
  matchScore: number;
  status: 'applied' | 'reviewing' | 'interview_scheduled' | 'rejected' | 'accepted';
  interviewDate?: string;
  sessionLink?: string;
  interviewSessionId?: string;
  interviewResults?: {
    score: number;
    summary: string;
  };
  notes?: string;
  createdAt?: string;
}

export const ApplicationDetailPage: React.FC = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchApplication();
  }, [appId]);

  const fetchApplication = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/applications/detail/${appId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch application');

      const data = await response.json();
      setApplication(data.application);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewDate) {
      alert('Please select an interview date');
      return;
    }

    // Validate interview is in the future
    if (new Date(interviewDate) < new Date()) {
      alert('Interview date must be in the future');
      return;
    }

    setScheduling(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:5000/api/interviews/schedule`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            applicationId: appId,
            scheduledTime: new Date(interviewDate).toISOString(),
            notes: notes,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to schedule interview');
      }

      const data = await response.json();

      setSuccess(true);
      setSuccessMessage(`✓ Interview scheduled for ${new Date(interviewDate).toLocaleString()}`);

      // Refresh application details
      setTimeout(() => {
        fetchApplication();
        setShowScheduleForm(false);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to schedule interview');
    } finally {
      setScheduling(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
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

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!application) return <div className="p-8 text-gray-600">Application not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow p-8">
          {/* Header */}
          <div className="border-b pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {application.candidate.name}
                </h1>
                <p className="text-gray-600 mt-1">Applied for: {application.job.title}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {application.matchScore}%
                </div>
                <p className="text-gray-600">Match Score</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <div className="flex items-center gap-2 text-gray-900">
                <Mail size={18} />
                <a href={`mailto:${application.candidate.email}`} className="hover:text-blue-600">
                  {application.candidate.email}
                </a>
              </div>
            </div>
            {application.candidate.phone && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <div className="flex items-center gap-2 text-gray-900">
                  <Phone size={18} />
                  {application.candidate.phone}
                </div>
              </div>
            )}
          </div>

          {/* Skills */}
          {application.resume.skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {application.resume.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Status & Interview */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Application Status</h2>
                <p className="text-sm text-gray-600 mt-1">Applied {new Date(application.createdAt || '').toLocaleDateString()}</p>
              </div>
              <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusBadgeColor(application.status)}`}>
                {application.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded p-4 mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                <p className="text-green-800">{successMessage}</p>
              </div>
            )}

            {/* Interview Scheduled Section */}
            {application.status === 'interview_scheduled' && application.interviewDate && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={20} className="text-blue-600" />
                  <span className="font-semibold text-blue-900">Interview Scheduled</span>
                </div>
                <p className="text-blue-800 mb-3 font-medium">
                  {new Date(application.interviewDate).toLocaleString()}
                </p>
                {application.sessionLink && (
                  <a
                    href={`http://localhost:3000${application.sessionLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold bg-white px-3 py-2 rounded border border-blue-300"
                  >
                    Session Link →
                  </a>
                )}
              </div>
            )}

            {/* Interview Results Section */}
            {application.interviewResults && (
              <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="font-semibold text-green-900">Interview Completed</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-700">Interview Score</p>
                    <p className="text-3xl font-bold text-green-600">{application.interviewResults.score}/100</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Summary</p>
                    <p className="text-sm text-green-900">{application.interviewResults.summary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Button */}
            {application.status === 'applied' && !showScheduleForm && (
              <button
                onClick={() => setShowScheduleForm(true)}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                <Calendar size={20} /> Schedule Interview
              </button>
            )}
          </div>

          {/* Schedule Form */}
          {showScheduleForm && (
            <form onSubmit={handleScheduleInterview} className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📅 Schedule Interview</h3>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Interview Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    required
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Select a future date and time</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Instructions / Notes for Candidate
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Please prepare a working environment and ensure good lighting..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none h-32 resize-none"
                  />
                </div>

                <div className="bg-white rounded border border-gray-200 p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">✓ Interview Details:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Candidate will receive email invitation</li>
                    <li>• Interview session link will be generated</li>
                    <li>• Technical and behavioral questions will be asked</li>
                    <li>• AI will analyze responses for relevance and clarity</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={scheduling || !interviewDate}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold transition"
                  >
                    {scheduling ? (
                      <>
                        <Loader size={18} className="animate-spin" /> Scheduling...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} /> Schedule Interview
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowScheduleForm(false);
                      setError('');
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Resume Download */}
          <div className="border-t pt-6">
            <a
              href={`http://localhost:5000/${application.resume.filePath}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              <Download size={20} /> Download Resume
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
