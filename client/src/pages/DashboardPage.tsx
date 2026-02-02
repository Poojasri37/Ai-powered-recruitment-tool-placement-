import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import DashboardStats from '../components/DashboardStats';
import JobCard from '../components/JobCard';
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
  requiredSkills: string[];
  description: string;
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed' | 'draft'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[500px]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 opacity-25"></div>
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-red-100">
      <div className="text-red-500 mb-4 font-medium">Error: {error}</div>
      <button onClick={fetchDashboardData} className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">Retry</button>
    </div>
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Recruiter Dashboard <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          </h1>
          <p className="text-gray-500 text-sm mt-1">Overview of your recruitment pipeline</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link
            to="/job-form"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 active:transform active:scale-95"
          >
            <Plus size={18} /> Post Job
          </Link>
        </div>
      </div>

      {/* Top Stats Cards */}
      <DashboardStats stats={stats} />

      {/* Analytics Charts */}
      <DashboardAnalytics jobs={jobs} applications={[]} />

      {/* Middle Section: Calendar & Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-2 space-y-8">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              Active Job Postings
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full border border-gray-200">{filteredJobs.length}</span>
            </h2>
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg transition-colors ${statusFilter !== 'all' ? 'bg-primary/10 text-primary border-primary/20' : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50'}`}
              >
                <Filter size={16} /> Filter {statusFilter !== 'all' && `(${statusFilter})`}
              </button>

              {showFilterMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-10 animate-fade-in p-1">
                  {['all', 'active', 'closed', 'draft'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status as any);
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${statusFilter === status ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {status} Jobs
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
            {filteredJobs.length === 0 && (
              <div className="col-span-full py-16 text-center text-gray-400 bg-white/40 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center">
                <Search size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">No jobs found matching "{searchTerm}"</p>
                <button onClick={() => setSearchTerm('')} className="mt-2 text-primary hover:underline">Clear search</button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Upcoming Interviews Calendar */}
          <div className="h-[400px]">
            <InterviewCalendar interviews={upcomingInterviews} />
          </div>

          {/* Recent Activity Feed */}
          <div className="h-[400px]">
            <ActivityTracker activities={recentActivity} />
          </div>
        </div>
      </div>
    </div>
  );
};
