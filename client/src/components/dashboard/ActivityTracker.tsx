import React from 'react';
import { Clock, CheckCircle, UserPlus, Calendar } from 'lucide-react';

export const ActivityTracker: React.FC = () => {
    // Mock recent activities (could be replaced by real audit log later)
    const activities = [
        { id: 1, type: 'interview', text: 'Interview scheduled with Sarah Johnson', time: '10 mins ago', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
        { id: 2, type: 'status', text: 'Mark Wilson status updated to "Hired"', time: '2 hours ago', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
        { id: 3, type: 'apply', text: 'New application for Senior React Dev', time: '4 hours ago', icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-100' },
        { id: 4, type: 'review', text: 'Reviewed 5 applications for Backend Role', time: 'Yesterday', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-gray-400" /> Recent Activity
            </h3>
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${activity.bg} shrink-0`}>
                            <activity.icon size={16} className={activity.color} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-800 font-medium leading-snug">{activity.text}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-100 rounded-lg hover:bg-blue-50 transition">
                View All History
            </button>
        </div>
    );
};
