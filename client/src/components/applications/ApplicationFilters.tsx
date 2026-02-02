import React from 'react';
import { Filter, Search, X } from 'lucide-react';

interface FiltersProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    statusFilter: string[];
    setStatusFilter: (val: string[]) => void;
    minScore: number;
    setMinScore: (val: number) => void;
    onClear: () => void;
}

export const ApplicationFilters: React.FC<FiltersProps> = ({
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    minScore, setMinScore,
    onClear
}) => {

    const toggleStatus = (status: string) => {
        if (statusFilter.includes(status)) {
            setStatusFilter(statusFilter.filter(s => s !== status));
        } else {
            setStatusFilter([...statusFilter, status]);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-wrap gap-6 items-end">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Keywords</label>
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Name, skills, email..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Status Filter */}
            <div className="min-w-[300px]">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Filter by Status</label>
                <div className="flex gap-2 flex-wrap">
                    {['applied', 'interview_scheduled', 'accepted', 'rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => toggleStatus(status)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${statusFilter.includes(status)
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                }`}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Score Slider */}
            <div className="w-[200px]">
                <div className="flex justify-between mb-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Min Match Score</label>
                    <span className="text-xs font-bold text-blue-600">{minScore}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
            </div>

            {/* Clear Button */}
            <button
                onClick={onClear}
                className="text-gray-500 hover:text-red-600 text-sm font-medium px-3 py-2 flex items-center gap-1"
            >
                <X size={16} /> Clear
            </button>
        </div>
    );
};
