import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface PerformanceReviewCardProps {
    results: {
        technicalScore: number;
        communicationScore: number;
        cultureFitScore: number;
        problemSolvingScore: number;
        feedback: string;
    };
}

export const PerformanceReviewCard: React.FC<PerformanceReviewCardProps> = ({ results }) => {
    const data = [
        { subject: 'Technical', A: results.technicalScore, fullMark: 100 },
        { subject: 'Communication', A: results.communicationScore, fullMark: 100 },
        { subject: 'Problem Solving', A: results.problemSolvingScore, fullMark: 100 },
        { subject: 'Culture Fit', A: results.cultureFitScore, fullMark: 100 },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Interview Performance Review</h3>

            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Candidate" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.5} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div>
                    <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100">
                        <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wide mb-2">AI Feedback Summary</h4>
                        <p className="text-sm text-blue-800 italic leading-relaxed">
                            "{results.feedback}"
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-800">{results.technicalScore}</div>
                            <div className="text-xs text-gray-500 uppercase">Technical</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-800">{results.communicationScore}</div>
                            <div className="text-xs text-gray-500 uppercase">Communication</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
