import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, Briefcase, Sparkles, FileText, X } from 'lucide-react';
import { API_URL } from '../config';

interface MatchResult {
    jobId: string;
    score: number;
    reasoning: string;
    jobTitle: string;
    company: string;
}

const TalentMatchUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [candidateName, setCandidateName] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
                setError('Only PDF/DOCX allowed');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError('');
            setMatches([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError('');
        setMatches([]);

        try {
            const formData = new FormData();
            formData.append('resume', file);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/candidates/match-jobs`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Matching failed');
            }

            const data = await response.json();
            setMatches(data.matches || []);
            setCandidateName(data.candidateName || 'Candidate');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm p-6 overflow-hidden relative">
            {/* Decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600 border border-purple-200 shadow-sm">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-base">AI Talent Matcher</h3>
                    <p className="text-gray-500 text-xs">Instantly match resumes to open jobs</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mb-6 relative z-10">
                <label className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${file ? 'border-purple-300 bg-purple-50/50' : 'border-gray-200 hover:border-purple-400 hover:bg-gray-50/80'
                    }`}>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.docx"
                        className="hidden"
                    />
                    <div className="flex flex-col items-center gap-2">
                        {file ? (
                            <div className="bg-white p-3 rounded-full shadow-sm text-purple-600 mb-1">
                                <FileText size={24} />
                            </div>
                        ) : (
                            <div className="bg-gray-100 p-3 rounded-full text-gray-400 mb-1 group-hover:bg-white group-hover:text-purple-500 transition-colors">
                                <Upload size={24} />
                            </div>
                        )}
                        <span className={`text-sm font-semibold ${file ? 'text-purple-700' : 'text-gray-600'}`}>
                            {file ? file.name : 'Drop resume here or click to browse'}
                        </span>
                        {!file && <span className="text-xs text-gray-400">Supports PDF, DOCX</span>}
                    </div>
                </label>

                {error && <div className="mt-3 p-2 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2 border border-red-100"><AlertCircle size={14} />{error}</div>}

                <button
                    type="submit"
                    disabled={!file || loading}
                    className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-sm shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...
                        </span>
                    ) : 'Find Automatic Matches'}
                </button>
            </form>

            {matches.length > 0 && (
                <div className="space-y-4 animate-slide-up relative z-10">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Top Job Matches</p>
                        <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{matches.length} found</span>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                        {matches.map((match) => (
                            <div key={match.jobId} className="bg-white/80 border border-gray-100 rounded-xl p-3 hover:shadow-md hover:border-purple-100 transition-all duration-200">
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-bold text-gray-800 text-sm line-clamp-1" title={match.jobTitle}>{match.jobTitle}</h5>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${match.score >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>{match.score}% Match</span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{match.reasoning}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TalentMatchUpload;
