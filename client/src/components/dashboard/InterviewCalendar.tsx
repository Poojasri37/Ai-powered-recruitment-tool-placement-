import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Video, User } from 'lucide-react';

interface Interview {
    id: string;
    candidateName: string;
    jobTitle: string;
    date: Date;
    status: 'scheduled' | 'completed' | 'cancelled';
}

export const InterviewCalendar: React.FC = () => {
    const [interviews, setInterviews] = useState<Interview[]>([]);

    useEffect(() => {
        // Determine upcoming dates for demo
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const dayAfter = new Date(today);
        dayAfter.setDate(today.getDate() + 2);

        // Mock data for upcoming interviews
        const mockInterviews: Interview[] = [
            { id: '1', candidateName: 'Alice Freeman', jobTitle: 'Frontend Engineer', date: new Date(today.setHours(14, 0)), status: 'scheduled' },
            { id: '2', candidateName: 'Bob Smith', jobTitle: 'Product Manager', date: new Date(tomorrow.setHours(10, 30)), status: 'scheduled' },
            { id: '3', candidateName: 'Charlie Davis', jobTitle: 'Backend Dev', date: new Date(tomorrow.setHours(15, 0)), status: 'scheduled' },
            { id: '4', candidateName: 'Dana Lee', jobTitle: 'UX Designer', date: new Date(dayAfter.setHours(11, 0)), status: 'scheduled' },
        ];
        setInterviews(mockInterviews);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CalendarIcon size={20} className="text-gray-400" /> Upcoming Interviews
            </h3>

            <div className="space-y-3">
                {interviews.map((interview) => (
                    <div key={interview.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition cursor-pointer group">
                        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-blue-100 text-blue-700 rounded w-12 h-12">
                            <span className="text-xs font-bold uppercase">{interview.date.toLocaleString('en-US', { month: 'short' })}</span>
                            <span className="text-lg font-bold leading-none">{interview.date.getDate()}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700">{interview.candidateName}</h4>
                            <p className="text-xs text-gray-500 truncate">{interview.jobTitle}</p>
                        </div>

                        <div className="text-right">
                            <span className="block text-xs font-medium text-gray-900">{formatTime(interview.date)}</span>
                            <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                                <Video size={10} /> Remote
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium text-center">
                View Full Calendar
            </button>
        </div>
    );
};
