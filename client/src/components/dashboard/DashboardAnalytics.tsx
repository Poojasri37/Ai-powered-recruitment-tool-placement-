import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Job } from '../../pages/DashboardPage';

interface DashboardAnalyticsProps {
    jobs: Job[];
    applications: any[]; // Using any for now, could be specific Application type
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ jobs, applications }) => {
    // 1. Applications per Job
    const applicationsPerJob = jobs.map(job => {
        // Determine count based on actual applications list if available, 
        // or fallback to job.applicationCount if it's already an aggregate
        const count = applications
            ? applications.filter(app => app.job === job._id || (typeof app.job === 'object' && app.job._id === job._id)).length
            : job.applicationCount;

        return {
            name: job.title.length > 15 ? job.title.substring(0, 15) + '...' : job.title,
            applications: count || Math.floor(Math.random() * 20) + 5 // Fallback mock for visual demo if count is 0
        };
    });

    // 2. Match Score Distribution (Mock data derived from real scores if available)
    // Determine ranges: 0-50, 50-70, 70-85, 85-100
    let scoreRanges = [
        { name: 'Low (<50%)', value: 0 },
        { name: 'Average (50-70%)', value: 0 },
        { name: 'Good (70-85%)', value: 0 },
        { name: 'Excellent (>85%)', value: 0 },
    ];

    if (applications && applications.length > 0) {
        applications.forEach(app => {
            const score = app.matchScore || 0;
            if (score < 50) scoreRanges[0].value++;
            else if (score < 70) scoreRanges[1].value++;
            else if (score < 85) scoreRanges[2].value++;
            else scoreRanges[3].value++;
        });
    } else {
        // Mock data for initial empty state visualization
        scoreRanges = [
            { name: 'Low', value: 10 },
            { name: 'Average', value: 25 },
            { name: 'Good', value: 35 },
            { name: 'Excellent', value: 15 },
        ];
    }

    const COLORS = ['#94a3b8', '#fbbf24', '#60a5fa', '#4ade80'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart: Applications per Job */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Applications per Job</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={applicationsPerJob} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: '#f8fafc' }}
                            />
                            <Bar dataKey="applications" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pie Chart: Match Score Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Match Score Distribution</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={scoreRanges}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {scoreRanges.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
