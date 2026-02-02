import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Calendar, LayoutGrid, List as ListIcon, Star, Download, Columns } from 'lucide-react';
import { Link } from 'react-router-dom';
import { KanbanBoard } from '../components/applications/KanbanBoard';
import { ApplicationFilters } from '../components/applications/ApplicationFilters';
import { ComparisonModal } from '../components/applications/ComparisonModal';
import { ScheduleInterviewModal } from '../components/applications/ScheduleInterviewModal';
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
      const token = localStorage.getItem('token');

      const jobRes = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!jobRes.ok) throw new Error('Failed to fetch job');
      const jobData = await jobRes.json();
      setJob(jobData.job);

      const appRes = await fetch(
        `http://localhost:5000/api/applications/job/${jobId}`,
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

    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/interviews/schedule', {
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

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job?.title}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {job?.requiredSkills.map((skill: string) => (
                  <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <ListIcon size={20} />
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`p-2 rounded-md transition ${viewMode === 'board' ? 'bg-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
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

        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          Candidates <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-sm">{filteredApplications.length}</span>
        </h2>

        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No applications match your filters</p>
          </div>
        ) : viewMode === 'board' ? (
          <KanbanBoard applications={filteredApplications} onStatusChange={handleStatusChange} />
        ) : (
          <div className="grid gap-4">
            {filteredApplications.map((app) => (
              <div key={app._id} className={`bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 ${shortlisted.includes(app._id) ? 'border-l-yellow-400' : 'border-l-transparent'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
                      {app.candidate.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {app.candidate.name}
                        <button onClick={() => toggleShortlist(app._id)} className="text-gray-300 hover:text-yellow-400 transition focus:outline-none">
                          <Star size={20} fill={shortlisted.includes(app._id) ? "gold" : "none"} className={shortlisted.includes(app._id) ? "text-yellow-400" : ""} />
                        </button>
                      </h3>
                      <p className="text-sm text-gray-600">{app.candidate.email}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {app.matchScore}%
                    </div>
                    <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor(app.status)}`}>
                      {app.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {(app.resume.skills || []).slice(0, 5).map(skill => (
                    <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                  {(app.resume.skills || []).length > 5 && (
                    <span className="text-xs text-gray-400 px-2 py-1">+{(app.resume.skills || []).length - 5} more</span>
                  )}
                </div>

                {app.status === 'interview_scheduled' && app.interviewDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 flex items-center gap-2 max-w-fit">
                    <Calendar size={16} className="text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Interview: {new Date(app.interviewDate).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center border-t pt-4 mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`compare-${app._id}`}
                      checked={selectedForComparison.includes(app._id)}
                      onChange={() => toggleComparison(app._id)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor={`compare-${app._id}`} className="text-sm text-gray-600 cursor-pointer select-none">Select for comparison</label>
                  </div>
                  <Link
                    to={`/application/${app._id}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    <Eye size={18} /> View Details
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
