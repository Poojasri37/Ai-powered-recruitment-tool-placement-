import React from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface JobCardProps {
  job: any;
  onUpdate?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onUpdate }) => {
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/jobs/${job._id}`, {
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
    <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
              {job.title.charAt(0)}
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">Active</span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors">
          {job.title}
        </h3>
        <p className="text-gray-500 text-sm mb-5 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Required Skills</p>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.slice(0, 3).map((skill: string) => (
              <span key={skill} className="bg-gray-50 text-gray-600 border border-gray-200 text-xs px-2.5 py-1 rounded-md font-medium">
                {skill}
              </span>
            ))}
            {job.requiredSkills.length > 3 && (
              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-md font-medium">+{job.requiredSkills.length - 3}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
        <Link
          to={`/job-applications/${job._id}`}
          className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition font-medium shadow-md shadow-blue-100"
        >
          <Eye size={18} /> View Applicants
        </Link>
        <button
          onClick={handleDelete}
          className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-100"
          title="Delete Job"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default JobCard;
