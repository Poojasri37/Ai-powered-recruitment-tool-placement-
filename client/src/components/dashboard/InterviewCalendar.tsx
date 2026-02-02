import React from 'react';
import { Calendar as CalendarIcon, Video, Clock, Monitor } from 'lucide-react';

interface Interview {
    id: string;
    candidateName: string;
    jobTitle: string;
    date: Date;
    status: 'scheduled' | 'completed' | 'cancelled';
}

export const InterviewCalendar: React.FC<{ interviews?: Interview[] }> = ({ interviews = [] }) => {
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CalendarIcon size={20} className="text-blue-500" /> Upcoming Interviews
            </h3>

            {interviews.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-8">
                    <CalendarIcon size={48} className="mb-2 opacity-20" />
                    <p>No interviews scheduled</p>
                </div>
            ) : (
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
                    {interviews.map((interview) => (
                        <div key={interview.id} className="group flex items-center gap-3 p-3 rounded-xl border border-transparent bg-white/50 hover:bg-white hover:border-blue-100 hover:shadow-md transition-all duration-200 cursor-pointer">
                            <div className="flex-shrink-0 flex flex-col items-center justify-center bg-blue-50 text-blue-600 rounded-lg w-14 h-14 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(interview.date).toLocaleString('en-US', { month: 'short' })}</span>
                                <span className="text-xl font-bold leading-none">{new Date(interview.date).getDate()}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{interview.candidateName}</h4>
                                <p className="text-xs text-gray-500 truncate">{interview.jobTitle}</p>
                            </div>

                            <div className="text-right flex flex-col gap-1 items-end">
                                <span className="flex items-center gap-1 text-xs font-medium text-gray-600">
                                    <Clock size={12} /> {formatTime(new Date(interview.date))}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                    <Video size={10} /> Online
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button className="w-full mt-4 py-2.5 text-sm text-blue-600 hover:text-white hover:bg-blue-600 font-medium text-center rounded-xl transition-all duration-200 border border-blue-100 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/20">
                View Full Calendar
            </button>
        </div>
    );
};
