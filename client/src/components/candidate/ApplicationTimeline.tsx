import React from 'react';
import { CheckCircle, Clock, Circle, XCircle } from 'lucide-react';

interface ApplicationTimelineProps {
    status: 'applied' | 'reviewing' | 'interview_scheduled' | 'rejected' | 'accepted';
}

export const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({ status }) => {
    const steps = [
        { id: 'applied', label: 'Applied' },
        { id: 'reviewing', label: 'Under Review' },
        { id: 'interview_scheduled', label: 'Interview' },
        { id: 'result', label: 'Result' },
    ];

    // Helper to determine step state
    const getStepState = (stepId: string, index: number) => {
        // Current status map to index
        const statusOrder = ['applied', 'reviewing', 'interview_scheduled', 'result'];

        // Map 'accepted'/'rejected' to 'result' for this logic
        const currentStatusNormalized = status === 'accepted' || status === 'rejected' ? 'result' : status;
        const currentIndex = statusOrder.indexOf(currentStatusNormalized);

        if (index < currentIndex) return 'completed';
        if (index === currentIndex) {
            if (stepId === 'result') {
                return status === 'accepted' ? 'success' : status === 'rejected' ? 'error' : 'current';
            }
            return 'current';
        }
        return 'upcoming';
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between relative px-2">
                {/* Connector Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200 -z-10" />

                {steps.map((step, idx) => {
                    const state = getStepState(step.id, idx);

                    return (
                        <div key={step.id} className="flex flex-col items-center bg-white px-2">
                            <div className={`
                     w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500
                     ${state === 'completed' ? 'bg-blue-600 border-blue-600 text-white' :
                                    state === 'current' ? 'bg-white border-blue-600 text-blue-600 animate-pulse' :
                                        state === 'success' ? 'bg-green-600 border-green-600 text-white' :
                                            state === 'error' ? 'bg-red-600 border-red-600 text-white' :
                                                'bg-white border-gray-300 text-gray-300'}
                  `}>
                                {state === 'completed' || state === 'success' ? <CheckCircle size={16} /> :
                                    state === 'error' ? <XCircle size={16} /> :
                                        state === 'current' ? <Clock size={16} /> :
                                            <Circle size={16} />}
                            </div>
                            <span className={`
                     text-xs font-medium mt-2 transition-colors duration-300
                     ${state === 'upcoming' ? 'text-gray-400' :
                                    state === 'error' ? 'text-red-600' :
                                        state === 'success' ? 'text-green-600' :
                                            'text-blue-900'}
                  `}>
                                {step.id === 'result' && status === 'accepted' ? 'Hired!' :
                                    step.id === 'result' && status === 'rejected' ? 'Not Selected' :
                                        step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
