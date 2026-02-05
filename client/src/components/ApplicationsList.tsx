import React, { useEffect, useState } from 'react';
import { Mail, Calendar, FileText, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { getAuthToken } from '../utils/auth';

interface Application {
  _id: string;
  candidate: {
    name: string;
    email: string;
  };
  matchScore: number;
  status: string;
  interviewDate?: string;
  createdAt: string;
}

interface ApplicationsListProps {
  jobId: string;
  onRefresh?: () => void;
}

const ApplicationsList: React.FC<ApplicationsListProps> = ({ jobId, onRefresh }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_URL}/api/applications/job/${jobId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch applications');

      const data = await response.json();
      setApplications(data.allCandidates || data.allApplications || []);
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

  if (loading) return <p className="text-gray-600">Loading applications...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (applications.length === 0)
    return <p className="text-gray-600">No applications yet</p>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Match Score
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {applications.map((app) => (
              <tr key={app._id} className="hover:bg-blue-50/50 transition-colors duration-150 group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {app.candidate.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{app.candidate.name}</div>
                      <div className="text-xs text-gray-500">Applied {new Date(app.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                    <Mail size={14} className="text-gray-400" />
                    {app.candidate.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${app.matchScore >= 80 ? 'bg-green-500' :
                          app.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        style={{ width: `${app.matchScore}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-gray-700 text-sm">
                      {app.matchScore}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${app.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' :
                      app.status === 'interview_scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}
                  >
                    {app.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    to={`/application/${app._id}`}
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-sm hover:underline"
                  >
                    <Edit2 size={16} /> Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationsList;
