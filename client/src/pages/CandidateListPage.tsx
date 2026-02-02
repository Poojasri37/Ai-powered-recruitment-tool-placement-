import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import CandidateList from '../components/CandidateList';
import ResumeUpload from '../components/ResumeUpload';
import { API_URL } from '../config';

export const CandidateListPage: React.FC = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchJobAndCandidates();
  }, [jobId]);

  const fetchJobAndCandidates = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch job
      const jobRes = await fetch(`${API_URL}/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!jobRes.ok) throw new Error('Failed to fetch job');
      const jobData = await jobRes.json();
      setJob(jobData.job);

      // Fetch candidates
      const candRes = await fetch(`${API_URL}/api/candidates/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!candRes.ok) throw new Error('Failed to fetch candidates');
      const candData = await candRes.json();
      setCandidates(candData.allCandidates || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link to="/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{job?.title}</h1>
          <p className="text-gray-600 mb-4">{job?.description}</p>
          <div className="flex flex-wrap gap-2">
            {job?.requiredSkills.map((skill: string) => (
              <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Candidates ({candidates.length})</h2>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Upload size={20} /> Upload Resume
          </button>
        </div>

        {showUpload && (
          <ResumeUpload
            jobId={jobId!}
            onSuccess={() => {
              setShowUpload(false);
              fetchJobAndCandidates();
            }}
          />
        )}

        <CandidateList candidates={candidates} />
      </div>
    </div>
  );
};
