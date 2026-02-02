import React, { useEffect, useState } from 'react';
import { Clock, Play } from 'lucide-react';

interface InterviewCountdownProps {
    interviewDate: string; // ISO string
    onJoin: () => void;
}

export const InterviewCountdown: React.FC<InterviewCountdownProps> = ({ interviewDate, onJoin }) => {
    const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            const interview = new Date(interviewDate);
            const diff = interview.getTime() - now.getTime();

            if (diff <= 0) {
                // Check if within acceptable "live" window (e.g., 1 hour)
                const absDiff = Math.abs(diff);
                if (absDiff < 60 * 60 * 1000) {
                    setIsLive(true);
                }
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ hours, minutes, seconds });
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, [interviewDate]);

    if (isLive) {
        return (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white text-center shadow-lg animate-pulse-slow">
                <h3 className="text-xl font-bold mb-2">Interview is Live!</h3>
                <p className="mb-4 opacity-90">Your session is ready to start.</p>
                <button
                    onClick={onJoin}
                    className="bg-white text-blue-600 px-6 py-2 rounded-full font-bold hover:bg-blue-50 transition transform hover:scale-105 flex items-center gap-2 mx-auto"
                >
                    <Play size={20} fill="currentColor" /> Join Now
                </button>
            </div>
        );
    }

    // Only show if within 24 hours
    if (timeLeft.hours > 24) return null;

    return (
        <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                    <Clock size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">Upcoming Interview</h3>
                    <p className="text-sm text-gray-500">Starts in <span className="font-mono font-bold text-blue-600">{timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span></p>
                </div>
                <button
                    disabled
                    className="ml-auto bg-gray-100 text-gray-400 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
                >
                    Join Later
                </button>
            </div>
        </div>
    );
};
