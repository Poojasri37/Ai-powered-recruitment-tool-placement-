import React from 'react';
import { Users, TrendingUp, FileText } from 'lucide-react';

interface DashboardStatsProps {
  jobs: any[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ jobs }) => {
  const stats = [
    {
      label: 'Total Jobs',
      value: jobs.length,
      icon: FileText,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Total Candidates',
      value: jobs.reduce((sum, job) => sum + (job.candidateCount || 0), 0),
      icon: Users,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Avg Match Score',
      value: '78%',
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="bg-white rounded-lg shadow p-6">
            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <Icon size={24} />
            </div>
            <p className="text-gray-600 text-sm">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
