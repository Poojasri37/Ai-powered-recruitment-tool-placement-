import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Application {
  _id: string;
  job: { title: string };
  candidate: { _id: string; name: string; email: string };
  matchScore: number;
  status: 'applied' | 'reviewing' | 'interview_scheduled' | 'rejected' | 'accepted';
  interviewDate?: string;
  createdAt: string;
}

export const JobApplicationsPage: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    fetchJobAndApplications();
  }, [jobId]);

  const fetchJobAndApplications = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch job
      const jobRes = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!jobRes.ok) throw new Error('Failed to fetch job');
      const jobData = await jobRes.json();
      setJob(jobData.job);

      // Fetch applications for this job
      const appRes = await fetch(
        `http://localhost:5000/api/applications/job/${jobId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!appRes.ok) throw new Error('Failed to fetch applications');
      const appData = await appRes.json();
      setApplications(appData.allApplications || appData.applications || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{job?.title}</h1>
          <p className="text-gray-600 mb-4">{job?.description}</p>
          <div className="flex flex-wrap gap-2">
            {job?.requiredSkills.map((skill: string) => (
              <span
                key={skill}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Applications ({applications.length})
        </h2>

        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No applications yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {applications.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {app.candidate.name}
                    </h3>
                    <p className="text-sm text-gray-600">{app.candidate.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {app.matchScore}%
                    </div>
                    <span
                      className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {app.status === 'interview_scheduled' && app.interviewDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 flex items-center gap-2">
                    <Calendar size={16} className="text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Interview: {new Date(app.interviewDate).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex gap-3">
                  <Link
                    to={`/application/${app._id}`}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    <Eye size={18} /> View Details
                  </Link>
                </div>

                <p className="text-xs text-gray-500 mt-3">
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
