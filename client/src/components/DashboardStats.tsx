import React from 'react';
import { Users, TrendingUp, FileText, ArrowUpRight, CheckCircle, Award } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    totalApplications?: number;
    interviewsScheduled?: number;
    hired?: number;
    interviewsCompleted?: number;
    averageInterviewScore?: number;
    [key: string]: any;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats: inputStats }) => {
  const stats = [
    {
      label: 'Total Applications',
      value: inputStats.totalApplications || 0,
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      iconColor: 'text-blue-500',
      bgIcon: 'bg-blue-50',
    },
    {
      label: 'Interviews Scheduled',
      value: inputStats.interviewsScheduled || 0,
      icon: Users,
      gradient: 'from-emerald-500 to-emerald-600',
      iconColor: 'text-emerald-500',
      bgIcon: 'bg-emerald-50',
    },
    {
      label: 'Interviews Completed',
      value: inputStats.interviewsCompleted || 0,
      icon: CheckCircle,
      gradient: 'from-cyan-500 to-cyan-600',
      iconColor: 'text-cyan-500',
      bgIcon: 'bg-cyan-50',
    },
    {
      label: 'Avg Interview Score',
      value: inputStats.averageInterviewScore || 0,
      icon: Award,
      gradient: 'from-amber-500 to-amber-600',
      iconColor: 'text-amber-500',
      bgIcon: 'bg-amber-50',
    },
    {
      label: 'Candidates Hired',
      value: inputStats.hired || 0,
      icon: TrendingUp,
      gradient: 'from-violet-500 to-violet-600',
      iconColor: 'text-violet-500',
      bgIcon: 'bg-violet-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 animate-slide-up">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="group relative overflow-hidden bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm hover:shadow-xl transition-all duration-300 p-6"
          >
            {/* Background decoration */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-xl ${stat.bgIcon} ${stat.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={24} />
              </div>
              <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                +12% <ArrowUpRight size={12} className="ml-1" />
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-4xl font-bold text-gray-900 group-hover:translate-x-1 transition-transform">
                {stat.value}
              </h3>
              <p className="text-gray-500 font-medium text-sm mt-1">
                {stat.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
