import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Mail, Phone, Download, CheckCircle, AlertCircle, Loader, User, Briefcase, Award, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

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
        `${API_URL}/api/applications/detail/${appId}`,
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
        `${API_URL}/api/interviews/schedule`,
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
        return 'bg-green-100/80 text-green-800 border-green-200';
      case 'interview_scheduled':
        return 'bg-purple-100/80 text-purple-800 border-purple-200';
      case 'rejected':
        return 'bg-red-100/80 text-red-800 border-red-200';
      case 'reviewing':
        return 'bg-yellow-100/80 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100/80 text-gray-800 border-gray-200';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (error) return <div className="p-8 text-red-600 font-medium bg-red-50 rounded-xl m-4">{error}</div>;
  if (!application) return <div className="p-8 text-gray-600">Application not found</div>;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <Link to={`/job-applications/${application.job._id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors font-medium text-sm">
        <ArrowLeft size={16} /> Back to Applications
      </Link>

      {/* Main Card */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/40 shadow-sm overflow-hidden mb-8 animate-slide-up">
        {/* Header Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>

        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-12 mb-6 gap-4">
            <div className="flex items-end gap-6">
              <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg shadow-black/10">
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-3xl font-bold text-gray-400">
                  {application.candidate.name.charAt(0)}
                </div>
              </div>
              <div className="mb-1">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  {application.candidate.name}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 text-sm font-medium mt-1">
                  <Briefcase size={14} /> Applied for <span className="text-primary">{application.job.title}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/50 shadow-sm">
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Match Score</div>
                <div className={`text-3xl font-bold ${application.matchScore >= 80 ? 'text-green-600' : application.matchScore >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                  {application.matchScore}%
                </div>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-8 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mr-4">
              <Calendar size={16} /> Applied {new Date(application.createdAt || '').toLocaleDateString()}
            </div>
            <span className={`px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wide border ${getStatusBadgeColor(application.status)}`}>
              {application.status.replace('_', ' ')}
            </span>
            <div className="flex-1"></div>
            <a
              href={`${API_URL}/${application.resume.filePath}`}
              className="inline-flex items-center gap-2 text-primary hover:text-blue-700 font-semibold text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Download size={16} /> Resume
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Info */}
            <div className="md:col-span-2 space-y-8">

              {/* Contact Info */}
              <div className="grd grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Contact Email</label>
                  <div className="flex items-center gap-2 text-gray-800 font-medium bg-white/50 p-3 rounded-xl border border-gray-100">
                    <Mail size={18} className="text-gray-400" />
                    <a href={`mailto:${application.candidate.email}`} className="hover:text-primary transition-colors">{application.candidate.email}</a>
                  </div>
                </div>
                {application.candidate.phone && (
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Phone</label>
                    <div className="flex items-center gap-2 text-gray-800 font-medium bg-white/50 p-3 rounded-xl border border-gray-100">
                      <Phone size={18} className="text-gray-400" />
                      {application.candidate.phone}
                    </div>
                  </div>
                )}
              </div>

              {/* Skills */}
              {application.resume.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Award className="text-primary" size={20} /> Skills & Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {application.resume.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-white hover:border-gray-300 transition-all hover:shadow-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience & Education would go here if available in detail */}
            </div>

            {/* Right Column: Actions */}
            <div className="space-y-6">
              {/* Interview Status Card */}
              {(application.status === 'interview_scheduled' || application.status === 'accepted' || application.interviewResults) && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-blue-100 shadow-inner">
                  <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                    <Calendar className="text-indigo-600" size={18} /> Interview Status
                  </h3>

                  {application.interviewDate && (
                    <div className="mb-4">
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1">Scheduled For</p>
                      <p className="text-indigo-900 font-semibold">{new Date(application.interviewDate).toLocaleString()}</p>
                    </div>
                  )}

                  {application.sessionLink && !application.interviewResults && (
                    <a
                      href={`${window.location.origin}${application.sessionLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 text-white font-semibold bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95 mb-3"
                    >
                      Join Session
                    </a>
                  )}

                  {application.interviewResults && (
                    <div className="mt-4 pt-4 border-t border-indigo-200/50">
                      <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                        <CheckCircle size={16} /> Completed
                      </div>
                      <div className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1">AI Evaluation</div>
                      <div className="text-3xl font-bold text-indigo-900 mb-2">{application.interviewResults.score}/100</div>
                      <p className="text-sm text-indigo-800 leading-snug bg-white/50 p-3 rounded-lg border border-indigo-100">
                        {application.interviewResults.summary}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Actions</h3>

                {application.status === 'applied' && !showScheduleForm && (
                  <button
                    onClick={() => setShowScheduleForm(true)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                  >
                    <Calendar size={18} /> Schedule Interview
                  </button>
                )}

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <button className="flex items-center justify-center gap-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
                    Reject
                  </button>
                  <button className="flex items-center justify-center gap-1 bg-green-50 border border-green-200 hover:bg-green-100 text-green-700 px-3 py-2 rounded-xl text-sm font-bold transition-colors">
                    Accept
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Form Modal/Inline */}
      {showScheduleForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><Calendar className="text-primary" /> Schedule Interview</h3>
              <button onClick={() => setShowScheduleForm(false)} className="text-gray-400 hover:text-gray-600"><AlertCircle className="rotate-45" size={24} /></button>
            </div>

            <form onSubmit={handleScheduleInterview} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Notes for Candidate</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Please prepare a working environment..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none h-24 resize-none transition-all"
                />
              </div>

              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">What happens next?</p>
                <ul className="text-sm text-blue-900/70 space-y-1 ml-4 list-disc">
                  <li>Candidate receives email invitation</li>
                  <li>Unique interview link is generated</li>
                  <li>AI interviewer will conduct the session</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling || !interviewDate}
                  className="flex-[2] bg-primary hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {scheduling ? <Loader size={18} className="animate-spin" /> : <CheckCircle size={18} />} Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {success && (
        <div className="fixed bottom-8 right-8 bg-green-900/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up z-50">
          <div className="bg-green-500 rounded-full p-1"><CheckCircle size={16} fill="white" className="text-green-900" /></div>
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

    </div>
  );
};
