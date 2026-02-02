import React, { useState } from 'react';
import { Edit2, Save, Plus, X } from 'lucide-react';

interface ResumePreviewProps {
    initialSkills: string[];
    initialExperience?: any[]; // Simplified for demo
    onUpdate: (skills: string[]) => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ initialSkills, onUpdate }) => {
    const [skills, setSkills] = useState<string[]>(initialSkills || []);
    const [newSkill, setNewSkill] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const handleAddSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            const updated = [...skills, newSkill.trim()];
            setSkills(updated);
            setNewSkill('');
            onUpdate(updated);
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        const updated = skills.filter(s => s !== skillToRemove);
        setSkills(updated);
        onUpdate(updated);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Resume Preview</h3>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                    {isEditing ? <><Save size={16} /> Done</> : <><Edit2 size={16} /> Edit Skills</>}
                </button>
            </div>

            <div className="space-y-6">
                {/* Skills Section */}
                <div>
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Detected Skills</h4>
                    <div className="flex flex-wrap gap-2">
                        {skills.map(skill => (
                            <span key={skill} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 group">
                                {skill}
                                {isEditing && (
                                    <button onClick={() => handleRemoveSkill(skill)} className="text-gray-400 hover:text-red-500">
                                        <X size={14} />
                                    </button>
                                )}
                            </span>
                        ))}
                        {skills.length === 0 && <p className="text-sm text-gray-500 italic">No skills detected yet.</p>}
                    </div>

                    {isEditing && (
                        <div className="mt-3 flex gap-2">
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                                placeholder="Add a missing skill..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleAddSkill}
                                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Mock Experience Section (Static for now as mostly parsing feedback) */}
                <div className="opacity-70">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Experience (Preview)</h4>
                    <div className="border-l-2 border-gray-200 pl-4 py-1">
                        <p className="font-bold text-gray-800">Software Engineer</p>
                        <p className="text-xs text-gray-500">Tech Corp Inc. • 2020 - Present</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
