import React, { useState } from 'react';
import { Calendar, CheckCircle, Loader, AlertCircle, X } from 'lucide-react';

interface ScheduleInterviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSchedule: (date: string, notes: string) => Promise<void>;
    candidateName: string;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
    isOpen,
    onClose,
    onSchedule,
    candidateName
}) => {
    const [date, setDate] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date) return;

        setLoading(true);
        setError('');
        try {
            await onSchedule(date, notes);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to schedule');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2">
                        <Calendar size={20} /> Schedule Interview
                    </h3>
                    <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <p className="mb-4 text-gray-600">Scheduling for: <span className="font-bold text-gray-900">{candidateName}</span></p>

                    {error && (
                        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded flex items-center gap-2 text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Date & Time</label>
                            <input
                                type="datetime-local"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Notes / Instructions</label>
                            <textarea
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="Instructions for the candidate..."
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                            Confirm Schedule
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
