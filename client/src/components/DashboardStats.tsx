import React from 'react';
import { Users, TrendingUp, FileText } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    totalApplications?: number; // Optional fallback or unused if we rely on jobs
    interviewsScheduled?: number;
    hired?: number;
    // We can also keep 'jobs' if needed, but the new design passes 'stats'
    [key: string]: any;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats: inputStats }) => {
  const stats = [
    {
      label: 'Total Applications',
      value: inputStats.totalApplications || 0,
      icon: FileText,
      color: 'bg-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Interviews Scheduled',
      value: inputStats.interviewsScheduled || 0,
      icon: Users,
      color: 'bg-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      label: 'Candidates Hired',
      value: inputStats.hired || 0,
      icon: TrendingUp,
      color: 'bg-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-6 flex flex-col justify-between group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-500 text-sm font-medium tracking-wide uppercase">{stat.label}</p>
                <h3 className="text-4xl font-extrabold text-gray-900 mt-2 tracking-tight group-hover:scale-105 transition-transform origin-left">{stat.value}</h3>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-xl shadow-inner`}>
                <Icon size={24} className={stat.textColor} />
              </div>
            </div>
            <div className={`h-1 w-full rounded-full bg-gray-100 overflow-hidden`}>
              <div className={`h-full ${stat.color} w-3/4 rounded-full opacity-80`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
