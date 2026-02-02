import React from 'react';
import { Clock, CheckCircle, UserPlus, Calendar, AlertCircle } from 'lucide-react';

interface Activity {
    id: string;
    type: string;
    text: string;
    time: string; // "Just now", "2 hrs ago" etc.
    timestamp: string; // Raw date
    color: string;
    bg: string;
}

export const ActivityTracker: React.FC<{ activities?: Activity[] }> = ({ activities = [] }) => {
    // Map string type to Icon component
    const getIcon = (type: string) => {
        switch (type) {
            case 'interview': return Calendar;
            case 'status': return CheckCircle;
            case 'apply': return UserPlus;
            case 'review': return Clock;
            default: return AlertCircle;
        }
    };

    return (
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Clock size={20} className="text-orange-500" /> Recent Activity
            </h3>

            {activities.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-8">
                    <Clock size={48} className="mb-2 opacity-20" />
                    <p>No recent activity</p>
                </div>
            ) : (
                <div className="space-y-0 relative flex-1 overflow-y-auto max-h-[400px] custom-scrollbar px-2">
                    {/* Timeline Line */}
                    <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100 rounded-full -z-10" />

                    {activities.map((activity) => {
                        const Icon = getIcon(activity.type);
                        return (
                            <div key={activity.id} className="flex items-start gap-4 py-3 group">
                                <div className={`relative z-10 p-2 rounded-xl ${activity.bg} shrink-0 ring-4 ring-white shadow-sm transition-transform duration-200 group-hover:scale-110`}>
                                    <Icon size={16} className={activity.color} />
                                </div>
                                <div className="bg-white/50 p-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-200 flex-1 min-w-0">
                                    <p className="text-sm text-gray-800 font-semibold leading-snug">{activity.text}</p>
                                    <p className="text-xs text-gray-500 mt-1 font-medium">{activity.time}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <button className="w-full mt-6 py-2.5 text-sm text-gray-600 hover:text-gray-900 font-medium text-center border border-gray-200 hover:border-gray-300 rounded-xl hover:bg-white/80 transition-all duration-200">
                View All History
            </button>
        </div>
    );
};
