import React, { useEffect, useState } from 'react';
import { Mail, Calendar, FileText, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/applications/job/${jobId}`,
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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Candidate
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Email
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Match Score
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {applications.map((app) => (
            <tr key={app._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-gray-900 font-medium">
                {app.candidate.name}
              </td>
              <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                <Mail size={16} /> {app.candidate.email}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${app.matchScore}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {app.matchScore}%
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                    app.status
                  )}`}
                >
                  {app.status.replace('_', ' ').toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4">
                <Link
                  to={`/application/${app._id}`}
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
                >
                  <Edit2 size={16} /> Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationsList;
