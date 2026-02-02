import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, Briefcase } from 'lucide-react';
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-hidden relative">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600 border border-purple-200">
                    <Briefcase size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">AI Talent Matcher</h3>
                    <p className="text-gray-500 text-xs">Instantly match resumes to jobs</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mb-4">
                <label className={`block border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${file ? 'border-purple-300 bg-purple-50' : 'border-gray-200 hover:border-purple-400 hover:bg-gray-50'
                    }`}>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.docx"
                        className="hidden"
                    />
                    <div className="flex flex-col items-center gap-1">
                        <Upload size={20} className={file ? 'text-purple-600' : 'text-gray-400'} />
                        <span className={`text-xs font-semibold ${file ? 'text-purple-700' : 'text-gray-600'}`}>
                            {file ? file.name : 'Drop resume here'}
                        </span>
                    </div>
                </label>

                {error && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}

                <button
                    type="submit"
                    disabled={!file || loading}
                    className="w-full mt-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-bold py-2 rounded-lg text-sm shadow-md transition-all"
                >
                    {loading ? 'Analyzing...' : 'Find Matches'}
                </button>
            </form>

            {matches.length > 0 && (
                <div className="space-y-3 animate-fade-in relative z-10">
                    <p className="text-xs font-bold text-gray-500 uppercase">Top Matches</p>
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {matches.map((match) => (
                            <div key={match.jobId} className="bg-gray-50 border border-gray-100 rounded-lg p-3 hover:shadow-sm">
                                <div className="flex justify-between items-start mb-1">
                                    <h5 className="font-bold text-gray-800 text-xs line-clamp-1" title={match.jobTitle}>{match.jobTitle}</h5>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${match.score >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>{match.score}%</span>
                                </div>
                                <p className="text-[10px] text-gray-500 line-clamp-2 leading-tight">{match.reasoning}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TalentMatchUpload;
