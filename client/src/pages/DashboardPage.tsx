import React, { useEffect, useState } from 'react';
import { Plus, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import JobCard from '../components/JobCard';
import DashboardStats from '../components/DashboardStats';

export const DashboardPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch jobs');

      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your recruitment pipeline</p>
          </div>
          <Link
            to="/job-form"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={20} /> Create Job
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <DashboardStats jobs={jobs} />

        {/* Jobs List */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Job Postings</h2>

          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No job postings yet</p>
              <Link
                to="/job-form"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Create your first job posting
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} onUpdate={fetchJobs} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
