import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Calendar, LayoutGrid, List as ListIcon, Star, Download, Columns } from 'lucide-react';
import { Link } from 'react-router-dom';
import { KanbanBoard } from '../components/applications/KanbanBoard';
import { ApplicationFilters } from '../components/applications/ApplicationFilters';
import { ComparisonModal } from '../components/applications/ComparisonModal';
import { ScheduleInterviewModal } from '../components/applications/ScheduleInterviewModal';
import { API_URL } from '../config';
import { getAuthToken } from '../utils/auth';
// import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable'; 

interface Application {
  _id: string;
  job: { title: string };
  candidate: { _id: string; name: string; email: string };
  resume: { skills: string[]; experience: any[]; education: any[] };
  matchScore: number;
  status: 'applied' | 'reviewing' | 'interview_scheduled' | 'rejected' | 'accepted';
  interviewDate?: string;
  createdAt: string;
}

export const JobApplicationsPage: React.FC = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [job, setJob] = useState<any>(null);

  // UI States
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [shortlisted, setShortlisted] = useState<string[]>([]);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    fetchJobAndApplications();
    const storedShortlist = localStorage.getItem(`shortlist_${jobId}`);
    if (storedShortlist) setShortlisted(JSON.parse(storedShortlist));
  }, [jobId]);

  useEffect(() => {
    if (jobId) localStorage.setItem(`shortlist_${jobId}`, JSON.stringify(shortlisted));
  }, [shortlisted, jobId]);

  useEffect(() => {
    let result = applications;

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(app =>
        app.candidate.name.toLowerCase().includes(lowerTerm) ||
        app.candidate.email.toLowerCase().includes(lowerTerm) ||
        (app.resume.skills || []).some(s => s.toLowerCase().includes(lowerTerm))
      );
    }

    if (statusFilter.length > 0) {
      result = result.filter(app => statusFilter.includes(app.status));
    }

    if (minScore > 0) {
      result = result.filter(app => app.matchScore >= minScore);
    }

    result.sort((a, b) => b.matchScore - a.matchScore);
    setFilteredApplications(result);
  }, [applications, searchTerm, statusFilter, minScore]);

  const fetchJobAndApplications = async () => {
    try {
      const token = getAuthToken();

      const jobRes = await fetch(`${API_URL}/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!jobRes.ok) throw new Error('Failed to fetch job');
      const jobData = await jobRes.json();
      setJob(jobData.job);

      const appRes = await fetch(
        `${API_URL}/api/applications/job/${jobId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!appRes.ok) throw new Error('Failed to fetch applications');
      const appData = await appRes.json();
      const apps = appData.allApplications || appData.applications || [];
      setApplications(apps);
      setFilteredApplications(apps);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleShortlist = (appId: string) => {
    setShortlisted(prev =>
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const toggleComparison = (appId: string) => {
    setSelectedForComparison(prev => {
      if (prev.includes(appId)) return prev.filter(id => id !== appId);
      if (prev.length >= 3) {
        alert("You can compare up to 3 candidates at a time.");
        return prev;
      }
      return [...prev, appId];
    });
  };

  // Scheduling State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [schedulingAppId, setSchedulingAppId] = useState<string | null>(null);

  const handleStatusChange = (appId: string, newStatus: string) => {
    if (newStatus === 'interview_scheduled') {
      setSchedulingAppId(appId);
      setScheduleModalOpen(true);
      return;
    }

    // Optimistic update for other statuses
    setApplications(prev => prev.map(app =>
      app._id === appId ? { ...app, status: newStatus as any } : app
    ));

    // Attempt backend update if generic endpoint exists (Silent fail if not found for now, but keeping UI optimistic)
    // In a full implementation, we'd check for a specific status update endpoint
  };

  const handleScheduleConfirm = async (date: string, notes: string) => {
    if (!schedulingAppId) return;

    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/interviews/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        applicationId: schedulingAppId,
        scheduledTime: new Date(date).toISOString(),
        notes: notes
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to schedule");
    }

    // Update local state on success
    setApplications(prev => prev.map(app =>
      app._id === schedulingAppId ? {
        ...app,
        status: 'interview_scheduled',
        interviewDate: date
      } : app
    ));
    setSchedulingAppId(null);
  };

  const handleExportShortlist = async () => {
    const appsToExport = applications.filter(app => shortlisted.includes(app._id));
    if (appsToExport.length === 0) {
      alert("No candidates shortlisted to export.");
      return;
    }

    import('jspdf').then(async ({ default: jsPDF }) => {
      import('jspdf-autotable').then(({ default: autoTable }) => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(`Shortlisted Candidates: ${job.title}`, 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);

        const tableData = appsToExport.map(app => [
          app.candidate.name,
          app.candidate.email,
          `${app.matchScore}%`,
          app.status.replace('_', ' '),
          (app.resume.skills || []).slice(0, 5).join(', ')
        ]);

        (doc as any).autoTable({
          head: [['Name', 'Email', 'Match Score', 'Status', 'Top Skills']],
          body: tableData,
          startY: 30,
        });

        doc.save('shortlist.pdf');
      });
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'interview_scheduled': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft size={20} /> Back to Dashboard
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handleExportShortlist}
              className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium"
            >
              <Download size={18} /> Export Shortlist ({shortlisted.length})
            </button>
            <button
              onClick={() => setShowComparison(true)}
              disabled={selectedForComparison.length < 2}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed font-medium"
            >
              <Columns size={18} /> Compare ({selectedForComparison.length})
            </button>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm p-8 mb-8 animate-slide-up">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{job?.title}</h1>
                <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">Active</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {job?.requiredSkills.map((skill: string) => (
                  <span key={skill} className="bg-gray-100/80 text-gray-700 border border-gray-200 px-3 py-1 rounded-lg text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                title="List View"
              >
                <ListIcon size={20} />
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'board' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                title="Kanban Board View"
              >
                <LayoutGrid size={20} />
              </button>
            </div>
          </div>
        </div>

        <ApplicationFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          minScore={minScore}
          setMinScore={setMinScore}
          onClear={() => {
            setSearchTerm('');
            setStatusFilter([]);
            setMinScore(0);
          }}
        />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Candidates <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-sm min-w-[24px] text-center">{filteredApplications.length}</span>
          </h2>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="bg-white/40 backdrop-blur rounded-2xl border border-dashed border-gray-300 p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <LayoutGrid size={32} />
            </div>
            <p className="text-gray-900 font-medium text-lg">No applications match your filters</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search terms or filters</p>
            <button onClick={() => { setSearchTerm(''); setStatusFilter([]); setMinScore(0); }} className="mt-4 text-primary hover:underline font-medium">Clear All Filters</button>
          </div>
        ) : viewMode === 'board' ? (
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <KanbanBoard applications={filteredApplications} onStatusChange={handleStatusChange} />
          </div>
        ) : (
          <div className="grid gap-4 animate-fade-in">
            {filteredApplications.map((app) => (
              <div key={app._id} className={`bg-white/70 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100 group ${shortlisted.includes(app._id) ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xl font-bold text-gray-500 shadow-inner">
                      {app.candidate.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {app.candidate.name}
                        <button onClick={() => toggleShortlist(app._id)} className="transition focus:outline-none transform hover:scale-110 active:scale-95">
                          <Star size={18} fill={shortlisted.includes(app._id) ? "#fbbf24" : "none"} className={shortlisted.includes(app._id) ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"} />
                        </button>
                      </h3>
                      <p className="text-sm text-gray-500">{app.candidate.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                    <div className={`text-2xl font-bold ${app.matchScore >= 80 ? 'text-green-600' : app.matchScore >= 50 ? 'text-yellow-600' : 'text-gray-400'}`}>
                      {app.matchScore}%
                    </div>
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${getStatusColor(app.status)}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {(app.resume.skills || []).slice(0, 5).map(skill => (
                    <span key={skill} className="text-xs bg-gray-50 border border-gray-100 text-gray-600 px-2 py-1 rounded-md">
                      {skill}
                    </span>
                  ))}
                  {(app.resume.skills || []).length > 5 && (
                    <span className="text-xs text-gray-400 px-2 py-1">+{(app.resume.skills || []).length - 5} more</span>
                  )}
                </div>

                {app.status === 'interview_scheduled' && app.interviewDate && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 mb-4 flex items-center gap-3 max-w-fit">
                    <div className="bg-white p-1.5 rounded-md shadow-sm text-blue-500"><Calendar size={14} /></div>
                    <div>
                      <p className="text-xs font-bold text-blue-900 uppercase">Interview Scheduled</p>
                      <p className="text-sm text-blue-700 font-medium">
                        {new Date(app.interviewDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-gray-50 pt-4 mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`compare-${app._id}`}
                      checked={selectedForComparison.includes(app._id)}
                      onChange={() => toggleComparison(app._id)}
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor={`compare-${app._id}`} className="text-sm text-gray-500 cursor-pointer select-none hover:text-gray-800 transition-colors">Compare Candidate</label>
                  </div>
                  <Link
                    to={`/application/${app._id}`}
                    className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-gray-200 hover:shadow-xl active:scale-95"
                  >
                    View Details <Eye size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <ComparisonModal
          candidates={applications.filter(app => selectedForComparison.includes(app._id))}
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
          requiredSkills={job?.requiredSkills || []}
        />

        <ScheduleInterviewModal
          isOpen={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          onSchedule={handleScheduleConfirm}
          candidateName={applications.find(a => a._id === schedulingAppId)?.candidate.name || 'Candidate'}
        />
      </div>
    </div>
  );
};
