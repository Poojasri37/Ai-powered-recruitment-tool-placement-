import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import CandidateList from '../components/CandidateList';
import ResumeUpload from '../components/ResumeUpload';
import { API_URL } from '../config';
import { getAuthToken } from '../utils/auth';

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
      const token = getAuthToken();

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-4 transition-colors font-medium text-sm">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}

        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm p-8 animate-slide-up">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{job?.title}</h1>
              <p className="text-gray-600 mb-6 max-w-2xl leading-relaxed">{job?.description}</p>
              <div className="flex flex-wrap gap-2">
                {job?.requiredSkills.map((skill: string) => (
                  <span key={skill} className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide border border-green-200">Active Job</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="text-primary" /> Candidates
          <span className="text-sm font-medium bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">{candidates.length}</span>
        </h2>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/20 font-medium"
        >
          <Upload size={18} /> {showUpload ? 'Cancel Upload' : 'Upload Resume'}
        </button>
      </div>

      {showUpload && (
        <div className="mb-8 animate-fade-in">
          <ResumeUpload
            jobId={jobId!}
            onSuccess={() => {
              setShowUpload(false);
              fetchJobAndCandidates();
            }}
          />
        </div>
      )}

      <div className="animate-slide-up animation-delay-200">
        <CandidateList candidates={candidates} />
      </div>
    </div>
  );
};
