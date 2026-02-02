import React, { useEffect, useState } from 'react';
import { Briefcase, MapPin, DollarSign, Calendar, Bookmark, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { JobMatchBreakdown } from '../components/candidate/JobMatchBreakdown';

interface Job {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  recruiter: {
    name: string;
    email: string;
    _id?: string;
  };
  createdAt: string;
}

export const CandidateJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // New features
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  // Mock candidate skills for demo matching - in real app, fetch from profile
  const candidateSkills = ['React', 'TypeScript', 'Node.js', 'Tailwind', 'MongoDB'];

  useEffect(() => {
    fetchJobs();
    const storedSaved = localStorage.getItem('savedJobs');
    if (storedSaved) setSavedJobIds(JSON.parse(storedSaved));
  }, []);

  const toggleSaveJob = (jobId: string) => {
    let newSaved;
    if (savedJobIds.includes(jobId)) {
      newSaved = savedJobIds.filter(id => id !== jobId);
    } else {
      newSaved = [...savedJobIds, jobId];
    }
    setSavedJobIds(newSaved);
    localStorage.setItem('savedJobs', JSON.stringify(newSaved));
  };

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/candidate-jobs', {
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

  const filteredJobs = jobs.filter(
    (job) => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.requiredSkills.some((skill) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        );

      if (activeTab === 'saved') {
        return matchesSearch && savedJobIds.includes(job._id);
      }
      return matchesSearch;
    }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Opportunities</h1>
              <p className="text-gray-600 mt-1">Find and apply to jobs that match your skills</p>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition ${activeTab === 'all' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                All Jobs
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition ${activeTab === 'saved' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Saved ({savedJobIds.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search jobs by title or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
          />
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No jobs found</h3>
            <p className="text-gray-500">Try adjusting your search or check back later.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <div key={job._id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full group">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition">{job.title}</h3>
                      <p className="text-sm text-gray-600 font-medium">{job.recruiter.name}</p>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); toggleSaveJob(job._id); }}
                      className="text-gray-400 hover:text-blue-600 transition p-1"
                    >
                      <Bookmark size={22} fill={savedJobIds.includes(job._id) ? "currentColor" : "none"} className={savedJobIds.includes(job._id) ? "text-blue-600" : ""} />
                    </button>
                  </div>

                  <p className="text-gray-600 mb-6 text-sm line-clamp-3 leading-relaxed">{job.description}</p>

                  <div className="mb-4">
                    {/* Smart Match Breakdown */}
                    <JobMatchBreakdown requiredSkills={job.requiredSkills} candidateSkills={candidateSkills} />
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center rounded-b-xl">
                  <div className="flex items-center text-xs text-gray-500 font-medium">
                    <Calendar size={14} className="mr-1.5" />
                    {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                  <Link
                    to={`/apply/${job._id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition shadow-md shadow-blue-200"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
