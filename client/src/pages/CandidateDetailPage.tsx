import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CandidateDetailPage: React.FC = () => {
  const { candidateId } = useParams();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCandidate();
  }, [candidateId]);

  const fetchCandidate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/candidates/detail/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch candidate');

      const data = await response.json();
      setCandidate(data.candidate);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!candidate) return <div className="p-8 text-gray-600">Candidate not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to={`/candidates/${candidate.job._id}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft size={20} /> Back to Candidates
        </Link>

        <div className="bg-white rounded-lg shadow p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{candidate.name}</h1>
              <p className="text-gray-600 mt-1">{candidate.email}</p>
              {candidate.phone && <p className="text-gray-600">{candidate.phone}</p>}
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">{candidate.matchScore}%</div>
              <p className="text-gray-600 text-sm">Match Score</p>
              <a
                href={`http://localhost:5000/${candidate.resumeFile}`}
                className="mt-2 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <Download size={18} /> Download Resume
              </a>
            </div>
          </div>

          {/* Skills */}
          {candidate.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill: string) => (
                  <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {candidate.education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Education</h2>
              <div className="space-y-3">
                {candidate.education.map((edu: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-blue-600 pl-4">
                    <p className="font-semibold text-gray-900">{edu.degree} in {edu.field}</p>
                    <p className="text-gray-600">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {candidate.experience.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Experience</h2>
              <div className="space-y-3">
                {candidate.experience.map((exp: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-green-600 pl-4">
                    <p className="font-semibold text-gray-900">{exp.title}</p>
                    <p className="text-gray-600">{exp.company}</p>
                    <p className="text-sm text-gray-500">{exp.duration}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
