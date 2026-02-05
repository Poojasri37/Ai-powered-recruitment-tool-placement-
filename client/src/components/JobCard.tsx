import React from 'react';
import { Eye, Trash2, MapPin, Briefcase, Clock, ArrowRight, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { getAuthToken } from '../utils/auth';

interface JobCardProps {
  job: any;
  onUpdate?: () => void;
  index?: number; // Added for staggered animation
}

const JobCard: React.FC<JobCardProps> = ({ job, onUpdate, index = 0 }) => {
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/jobs/${job._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete job');

      onUpdate?.();
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  return (
    <div
      className="group bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 p-6 flex flex-col justify-between h-full relative overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-5">
          <div className="p-3 bg-white shadow-sm rounded-xl border border-gray-100 group-hover:border-blue-100 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
              {job.title.charAt(0)}
            </div>
          </div>
          <span className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full border uppercase tracking-wider transition-colors ${job.status === 'active'
            ? 'bg-green-50 text-green-700 border-green-200 group-hover:bg-green-100'
            : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {job.status}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-primary transition-colors cursor-pointer">
          {job.title}
        </h3>

        <div className="flex flex-wrap gap-y-2 gap-x-4 mb-5 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
            <Briefcase size={12} className="text-gray-400" />
            {job.department}
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
            <MapPin size={12} className="text-gray-400" />
            {job.location}
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed h-10">
          {job.description}
        </p>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.slice(0, 3).map((skill: string) => (
              <span key={skill} className="bg-white text-gray-600 border border-gray-200 text-xs px-2.5 py-1 rounded-lg font-medium shadow-sm">
                {skill}
              </span>
            ))}
            {job.requiredSkills.length > 3 && (
              <span className="bg-white text-gray-400 border border-gray-100 text-xs px-2 py-1 rounded-lg font-medium">+{job.requiredSkills.length - 3}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-100/50 mt-auto relative z-10">
        <Link
          to={`/job-applications/${job._id}`}
          className="flex-1 bg-gray-50 hover:bg-gray-900 hover:text-white text-gray-700 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-semibold text-sm group/btn border border-gray-200 hover:border-gray-900 hover:shadow-lg hover:shadow-gray-900/20"
        >
          <Users size={16} className="text-gray-400 group-hover/btn:text-white transition-colors" />
          <span>View Applicants</span>
          {job.applicationCount > 0 && (
            <span className="ml-1 bg-gray-200 group-hover/btn:bg-gray-700 group-hover/btn:text-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] transition-colors">{job.applicationCount}</span>
          )}
        </Link>
        <button
          onClick={handleDelete}
          className="p-2.5 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all border border-gray-200 hover:border-red-100 shadow-sm hover:rotate-12"
          title="Delete Job"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default JobCard;
