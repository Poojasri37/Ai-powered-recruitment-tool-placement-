import React from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

interface ComparisonModalProps {
    candidates: any[];
    isOpen: boolean;
    onClose: () => void;
    requiredSkills: string[];
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({ candidates, isOpen, onClose, requiredSkills }) => {
    if (!isOpen || candidates.length === 0) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Candidate Comparison</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-x-auto p-6 bg-gray-50">
                    <div className="flex gap-6 min-w-max">
                        {/* Labels Column */}
                        <div className="w-48 pt-32 space-y-8 font-semibold text-gray-500 text-sm hidden md:block">
                            <div className="h-8">Match Score</div>
                            <div className="h-8">Experience</div>
                            <div className="h-8">Education</div>
                            <div className="py-2">Skills Match</div>
                            <div className="py-2">Missing Skills</div>
                        </div>

                        {/* Candidate Columns */}
                        {candidates.map(candidate => (
                            <div key={candidate._id} className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-shrink-0 relative">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 text-center border-b border-gray-100">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl mx-auto shadow-sm mb-3">
                                        {candidate.candidate.name.charAt(0)}
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-lg truncate">{candidate.candidate.name}</h3>
                                    <p className="text-xs text-gray-500 truncate">{candidate.candidate.email}</p>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-8">
                                    <div className="text-center">
                                        <span className="md:hidden block text-xs text-gray-400 mb-1">Match Score</span>
                                        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-bold text-lg">
                                            {candidate.matchScore}%
                                        </div>
                                    </div>

                                    <div>
                                        <span className="md:hidden block text-xs text-gray-400 mb-1">Experience</span>
                                        <p className="text-sm text-gray-700 line-clamp-2">
                                            {candidate.resume.experience?.[0]?.position || 'Not specified'}
                                            <span className="text-gray-400 block text-xs">{candidate.resume.experience?.[0]?.company}</span>
                                        </p>
                                    </div>

                                    <div>
                                        <span className="md:hidden block text-xs text-gray-400 mb-1">Education</span>
                                        <p className="text-sm text-gray-700 line-clamp-2">
                                            {candidate.resume.education?.[0]?.degree || 'Not specified'}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="md:hidden block text-xs text-gray-400 mb-1">Skills Match</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {candidate.resume.skills?.slice(0, 5).map((skill: string) => (
                                                <span key={skill} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded border border-green-100 flex items-center gap-1">
                                                    <Check size={10} /> {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Missing Skills Highlight */}
                                    <div>
                                        <span className="md:hidden block text-xs text-gray-400 mb-1">Missing Skills</span>
                                        {(() => {
                                            const candidateSkills = (candidate.resume.skills || []).map((s: string) => s.toLowerCase());
                                            const missing = requiredSkills.filter(req => !candidateSkills.some((s: string) => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s)));

                                            return missing.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {missing.map(skill => (
                                                        <span key={skill} className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded border border-red-100 flex items-center gap-1">
                                                            <AlertCircle size={10} /> {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-green-600 text-sm flex items-center gap-1"><Check size={14} /> All key skills matched</div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
