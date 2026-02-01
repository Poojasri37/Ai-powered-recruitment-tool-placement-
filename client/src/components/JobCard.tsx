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
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Required Skills:</p>
        <div className="flex flex-wrap gap-1">
          {job.requiredSkills.slice(0, 3).map((skill: string) => (
            <span key={skill} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 3 && (
            <span className="text-gray-500 text-xs px-2 py-1">+{job.requiredSkills.length - 3}</span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          to={`/job-applications/${job._id}`}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <Eye size={18} /> View Applications
        </Link>
        <button
          onClick={handleDelete}
          className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg transition"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default JobCard;
