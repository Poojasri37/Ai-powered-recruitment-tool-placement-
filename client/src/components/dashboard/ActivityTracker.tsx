import React from 'react';
import { Clock, CheckCircle, UserPlus, Calendar } from 'lucide-react';

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
            default: return Clock;
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-gray-400" /> Recent Activity
            </h3>
            <div className="space-y-4">
                {activities.map((activity) => {
                    const Icon = getIcon(activity.type);
                    return (
                        <div key={activity.id} className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${activity.bg} shrink-0`}>
                                <Icon size={16} className={activity.color} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-800 font-medium leading-snug">{activity.text}</p>
                                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-100 rounded-lg hover:bg-blue-50 transition">
                View All History
            </button>
        </div>
    );
};
