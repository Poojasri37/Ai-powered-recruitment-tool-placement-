import React from 'react';
import { TrendingUp, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Candidate {
  _id: string;
  name: string;
  email: string;
  matchScore: number;
}

interface CandidateListProps {
  candidates: Candidate[];
}

const CandidateList: React.FC<CandidateListProps> = ({ candidates }) => {
  if (candidates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No candidates uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Match Score</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {candidates.map((candidate) => (
            <tr key={candidate._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-gray-900 font-medium">{candidate.name}</td>
              <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                <Mail size={16} /> {candidate.email}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${candidate.matchScore}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-gray-900">{candidate.matchScore}%</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <Link
                  to={`/candidate/${candidate._id}`}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CandidateList;
