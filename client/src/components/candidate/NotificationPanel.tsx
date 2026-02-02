import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';

export const NotificationPanel: React.FC = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Determine notifications from localstorage state or mock logic
        // In a real app, this would come from a websocket or polling
        const checkNotifications = () => {
            const notes = [];
            // Mock logic: Check if any "saved" job exists
            const saved = localStorage.getItem('savedJobs');
            if (saved && JSON.parse(saved).length > 0) {
                // This is just a static reminder for demo
                // notes.push({ id: 1, title: 'Saved Jobs', msg: 'You have saved jobs pending application.' });
            }

            // Mock: "Interview Tomorrow"
            notes.push({ id: 2, title: 'Interview Reminder', msg: 'Your interview for Frontend Dev is tomorrow at 10 AM.', type: 'info' });
            // Mock: "Shortlisted"
            notes.push({ id: 3, title: 'Good News!', msg: 'You have been shortlisted for Backend Engineer.', type: 'success' });

            setNotifications(notes);
        };

        checkNotifications();
    }, []);

    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
            {notifications.map(note => (
                <div key={note.id} className="bg-white border-l-4 border-blue-500 shadow-xl rounded-r-lg p-4 w-80 animate-slide-in relative">
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
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
