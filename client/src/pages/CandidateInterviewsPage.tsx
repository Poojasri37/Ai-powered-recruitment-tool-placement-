import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { FileText, Calendar, CheckCircle, Clock, Star, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken } from '../utils/auth';

interface Interview {
    _id: string;
    job: {
        title: string;
        recruiter: {
            name: string;
        };
    };
    status: string;
    interviewDate: string;
    interviewResults?: {
        technicalScore?: number;
        communicationScore?: number;
        cultureFitScore?: number;
        feedback?: string;
    };
    matchScore: number;
}

export const CandidateInterviewsPage: React.FC = () => {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_URL}/api/candidate-jobs/candidate/applications/list`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to fetch interviews');

            const data = await response.json();
            // Filter for applications that have an interview scheduled or completed
            const interviewList = (data.applications || []).filter((app: any) =>
                app.status === 'interview_scheduled' ||
                app.status === 'accepted' ||
                app.status === 'rejected' ||
                app.interviewDate
            );

            setInterviews(interviewList);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getAverageScore = (results: any) => {
        if (!results) return 0;
        const scores = [results.technicalScore, results.communicationScore, results.cultureFitScore].filter(s => s !== undefined);
        if (scores.length === 0) return 0;
        return Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Interviews</h1>
                    <p className="text-gray-500 mt-2">Track your interview history and performance results.</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 border border-red-100">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {interviews.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="text-blue-500 w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No interviews yet</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            You haven't attended any interviews yet. Apply to jobs to get started!
                        </p>
                        <button
                            onClick={() => navigate('/candidate-jobs')}
                            className="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30"
                        >
                            Browse Jobs
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {interviews.map((interview) => {
                            const isCompleted = new Date(interview.interviewDate) < new Date() || interview.status === 'accepted' || interview.status === 'rejected';
                            const avgScore = getAverageScore(interview.interviewResults) || interview.matchScore || 0;

                            return (
                                <div key={interview._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">{interview.job.title}</h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                                    <span className="font-medium text-gray-700">{interview.job.recruiter.name}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {new Date(interview.interviewDate).toLocaleDateString()}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {isCompleted ? <CheckCircle size={14} /> : <Clock size={14} />}
                                                {isCompleted ? 'Completed' : 'Scheduled'}
                                            </div>
                                        </div>

                                        <hr className="my-6 border-gray-100" />

                                        <div className="flex flex-col sm:flex-row gap-6">
                                            <div className="flex-1">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Status</h4>
                                                <p className="text-sm font-medium text-gray-800 capitalize bg-gray-50 inline-block px-3 py-1 rounded-lg border border-gray-200">
                                                    {interview.status.replace('_', ' ')}
                                                </p>
                                            </div>

                                            {isCompleted && (
                                                <div className="flex-1">
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Performance Score</h4>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-2xl font-bold text-gray-900">{avgScore}%</div>
                                                        <div className="flex text-yellow-400">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={16} fill={i < Math.round(avgScore / 20) ? "currentColor" : "none"} className={i < Math.round(avgScore / 20) ? "" : "text-gray-300"} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {isCompleted && interview.interviewResults?.feedback && (
                                                <div className="flex-[2]">
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Feedback</h4>
                                                    <p className="text-sm text-gray-600 leading-relaxed italic">
                                                        "{interview.interviewResults.feedback}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
