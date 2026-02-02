import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Job } from '../../pages/DashboardPage';

interface DashboardAnalyticsProps {
    jobs: Job[];
    applications: any[];
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ jobs, applications }) => {
    // 1. Applications per Job
    const applicationsPerJob = jobs.map(job => {
        const count = applications
            ? applications.filter(app => app.job === job._id || (typeof app.job === 'object' && app.job._id === job._id)).length
            : job.applicationCount || 0;

        return {
            name: job.title.length > 15 ? job.title.substring(0, 15) + '...' : job.title,
            applications: count
        };
    }).filter(item => item.applications > 0); // Only show jobs with applications to keep it clean

    // 2. Match Score Distribution
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
    }

    const COLORS = ['#94a3b8', '#fbbf24', '#60a5fa', '#4ade80'];

    if (applicationsPerJob.length === 0 && (!applications || applications.length === 0)) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/60 backdrop-blur-md p-8 rounded-2xl border border-white/40 shadow-sm flex items-center justify-center text-gray-500 italic h-64">
                    No application data available yet.
                </div>
                <div className="bg-white/60 backdrop-blur-md p-8 rounded-2xl border border-white/40 shadow-sm flex items-center justify-center text-gray-500 italic h-64">
                    No matching scores analysis yet.
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-slide-up animation-delay-200">
            {/* Bar Chart: Applications per Job */}
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Applications per Job</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={applicationsPerJob} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)' }}
                                cursor={{ fill: '#f1f5f9' }}
                            />
                            <Bar dataKey="applications" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pie Chart: Match Score Distribution */}
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Match Score Distribution</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={scoreRanges}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {scoreRanges.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
