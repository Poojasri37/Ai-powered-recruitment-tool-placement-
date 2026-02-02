import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

interface JobMatchBreakdownProps {
    requiredSkills: string[];
    candidateSkills: string[];
}

export const JobMatchBreakdown: React.FC<JobMatchBreakdownProps> = ({ requiredSkills, candidateSkills }) => {
    const normalizedCandidateSkills = candidateSkills.map(s => s.toLowerCase());

    const matched = requiredSkills.filter(req =>
        normalizedCandidateSkills.some(cand => cand.includes(req.toLowerCase()) || req.toLowerCase().includes(cand))
    );

    const missing = requiredSkills.filter(req =>
        !normalizedCandidateSkills.some(cand => cand.includes(req.toLowerCase()) || req.toLowerCase().includes(cand))
    );

    const matchPercentage = Math.round((matched.length / requiredSkills.length) * 100) || 0;

    return (
        <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm mt-4">
            <div className="flex justify-between items-end mb-2">
                <h4 className="font-bold text-gray-800 text-sm">Match Breakdown</h4>
                <span className={`text-sm font-bold ${matchPercentage >= 70 ? 'text-green-600' : matchPercentage >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {matchPercentage}% Match
                </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                    className={`h-2 rounded-full transition-all duration-500 ${matchPercentage >= 70 ? 'bg-green-500' : matchPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                    style={{ width: `${matchPercentage}%` }}
                />
            </div>

            <div className="space-y-3">
                {/* Matched Skills */}
                {matched.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                            <Check size={12} className="text-green-500" /> Matched Skills
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {matched.map(skill => (
                                <span key={skill} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded border border-green-100">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Missing Skills */}
                {missing.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                            <X size={12} className="text-red-500" /> Missing Required Skills
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {missing.map(skill => (
                                <span key={skill} className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded border border-red-100">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {missing.length > 0 && (
                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded flex items-start gap-2 mt-2">
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <span>Adding missing skills to your resume can significantly increase your chances!</span>
                    </div>
                )}
            </div>
        </div>
    );
};
