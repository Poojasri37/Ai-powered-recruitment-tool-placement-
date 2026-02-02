import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';

interface NotificationPanelProps {
    applications?: any[];
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ applications = [] }) => {
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (!applications.length) return;

        const notes: any[] = [];

        // Generate notifications from applications
        applications.forEach(app => {
            if (app.status === 'interview_scheduled' && app.interviewDate) {
                const interviewDate = new Date(app.interviewDate);
                const today = new Date();
                const diffTime = interviewDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays >= 0 && diffDays <= 3) {
                    notes.push({
                        id: `interview-${app._id}`,
                        title: 'Upcoming Interview',
                        msg: `Interview for ${app.job.title} is in ${diffDays === 0 ? 'today' : diffDays + ' days'}.`,
                        type: 'info'
                    });
                }
            } else if (app.status === 'accepted') {
                notes.push({
                    id: `accepted-${app._id}`,
                    title: 'Congratulations!',
                    msg: `Your application for ${app.job.title} has been accepted!`,
                    type: 'success'
                });
            } else if (app.status === 'rejected') {
                // Optional: decide if we want to notify rejections
            }
        });

        setNotifications(notes);
    }, [applications]);

    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
            {notifications.map(note => (
                <div key={note.id} className={`border-l-4 shadow-xl rounded-r-lg p-4 w-80 animate-slide-in relative bg-white ${note.type === 'success' ? 'border-green-500' : 'border-blue-500'}`}>
                    <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                        onClick={() => setNotifications(prev => prev.filter(n => n.id !== note.id))}
                    >
                        <X size={14} />
                    </button>
                    <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <Bell size={14} className={note.type === 'success' ? 'text-green-500' : 'text-blue-500'} />
                        {note.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">{note.msg}</p>
                </div>
            ))}
        </div>
    );
};
