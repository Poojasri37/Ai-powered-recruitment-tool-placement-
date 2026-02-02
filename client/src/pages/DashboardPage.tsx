import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import DashboardStats from '../components/DashboardStats';
import JobCard from '../components/JobCard';
import TalentMatchUpload from '../components/TalentMatchUpload';
import { DashboardAnalytics } from '../components/dashboard/DashboardAnalytics';
import { ActivityTracker } from '../components/dashboard/ActivityTracker';
import { InterviewCalendar } from '../components/dashboard/InterviewCalendar';

export interface Job {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  applicationCount: number;
  status: 'active' | 'draft' | 'closed';
  createdAt: string;
}

export const DashboardPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');



  const [stats, setStats] = useState({
    totalApplications: 0,
    interviewsScheduled: 0,
    hired: 0
  });
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch Jobs
      const jobsRes = await fetch(`${API_URL}/api/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jobsData = await jobsRes.json();
      setJobs(jobsData.jobs || jobsData.data || []);

      // Fetch Stats
      const statsRes = await fetch(`${API_URL}/api/applications/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
        setUpcomingInterviews(statsData.upcomingInterviews);
        setRecentActivity(statsData.recentActivity);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center">
      <div className="text-red-500 mb-4">Error: {error}</div>
      <button onClick={fetchDashboardData} className="bg-blue-600 text-white px-4 py-2 rounded">Retry</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Detailed Analytics Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Recruiter Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Link
                to="/job-form"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition-all shadow-lg shadow-blue-200"
              >
                <Plus size={18} /> Post New Job
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Top Stats Cards */}
        <DashboardStats stats={stats} />

        {/* Analytics Charts */}
        <DashboardAnalytics jobs={jobs} applications={[]} />

        {/* Middle Section: Calendar & Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          <div className="xl:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Active Job Postings</h2>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Filter size={16} /> Filter
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
              {filteredJobs.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                  No jobs found matching your search.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Upcoming Interviews Calendar */}
            <InterviewCalendar interviews={upcomingInterviews} />

            {/* Recent Activity Feed */}
            <ActivityTracker activities={recentActivity} />

            {/* Talent Pool Match Upload */}
            <TalentMatchUpload />
          </div>
        </div>
      </div>
    </div>
  );
};
