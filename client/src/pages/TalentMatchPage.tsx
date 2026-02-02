import React from 'react';
import TalentMatchUpload from '../components/TalentMatchUpload';
import { Sparkles } from 'lucide-react';

export const TalentMatchPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        AI Talent Matcher <Sparkles className="w-5 h-5 text-purple-500 fill-purple-500" />
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Upload resumes to automatically find the best job matches</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto mt-8">
                <TalentMatchUpload />
            </div>
        </div>
    );
};
