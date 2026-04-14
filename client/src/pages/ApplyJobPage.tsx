import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Upload, AlertCircle, ArrowLeft, Check, ChevronRight, Loader2 } from 'lucide-react';
import { ResumePreview } from '../components/candidate/ResumePreview';
import { API_URL } from '../config';
import { getAuthToken } from '../utils/auth';

export const ApplyJobPage: React.FC = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [parsing, setParsing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Step State
    const [step, setStep] = useState(1);
    const [parsedSkills, setParsedSkills] = useState<string[]>([]);
    const [parsedExperience, setParsedExperience] = useState<any[]>([]);
    const [projectedScore, setProjectedScore] = useState<number | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const isValid = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(
                selectedFile.type
            );

            if (!isValid) {
                setError('Only PDF and DOCX files are allowed');
                setFile(null);
                return;
            }

            setFile(selectedFile);
            setError('');
            setParsing(true);

            try {
                const formData = new FormData();
                formData.append('resume', selectedFile);
                if (jobId) formData.append('jobId', jobId);
                
                const token = getAuthToken();

                const response = await fetch(`${API_URL}/api/candidates/parse`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });

                const data = await response.json();
                if (data.success) {
                    setParsedSkills(data.data.skills || []);
                    setParsedExperience(data.data.experience || []);
                    setProjectedScore(data.matchScore || 0);
                    setStep(2);
                } else {
                    setError(data.error || 'Failed to detect information from resume');
                }
            } catch (err) {
                setError('Error connecting to server. Please try again.');
            } finally {
                setParsing(false);
            }
        }
    };

    const handleUpdateSkills = (updatedSkills: string[]) => {
        setParsedSkills(updatedSkills);
    };

    const handleSubmit = async () => {
        if (!file || !jobId) {
            setError('Missing required information. Please try again.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('resume', file);
            // Send updated skills to backend
            formData.append('skills', JSON.stringify(parsedSkills));
            
            const token = getAuthToken();
            const response = await fetch(`${API_URL}/api/candidate-jobs/${jobId}/apply`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Application failed');
            }

            setSuccess(`Application submitted! Final Score: ${data.matchScore}%`);
            setFile(null);
            setTimeout(() => navigate('/candidate-dashboard'), 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <Link to="/candidate-jobs" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium">
                    <ArrowLeft size={20} /> Back to Jobs
                </Link>

                {/* Steps */}
                <div className="flex items-center mb-8 gap-4 px-2">
                    <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white relative overflow-hidden">
                        {/* Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                        
                        <h1 className="text-2xl font-bold relative z-10">Job Application</h1>
                        <p className="text-blue-100 text-sm mt-1 relative z-10">
                            {step === 1 ? 'Upload your latest resume to start the process' : 'Verify how the system sees your profile'}
                        </p>
                    </div>

                    <div className="p-8">
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${parsing ? 'bg-blue-50/50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:border-blue-400'}`}>
                                    {parsing ? (
                                        <div className="space-y-4">
                                            <div className="flex justify-center">
                                                <Loader2 className="text-blue-600 animate-spin" size={48} />
                                            </div>
                                            <p className="text-blue-600 font-bold">Analyzing your resume...</p>
                                            <p className="text-xs text-blue-400">Extracting skills and experience for matching</p>
                                        </div>
                                    ) : (
                                        <label className="block cursor-pointer">
                                            <div className="bg-white w-20 h-20 rounded-2xl shadow-md flex items-center justify-center mx-auto mb-6 transform transition hover:scale-105">
                                                <Upload className="text-blue-600" size={32} />
                                            </div>
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                accept=".pdf,.docx"
                                                className="hidden"
                                                id="resume-upload"
                                            />
                                            <span className="block text-xl font-bold text-gray-800 mb-2">Upload Resume</span>
                                            <span className="block text-sm text-gray-500 font-medium">Click to browse or drag and drop</span>
                                            <div className="mt-4 flex justify-center gap-3">
                                                <span className="bg-white px-3 py-1 rounded-lg border border-gray-100 text-[10px] font-bold text-gray-400 uppercase">PDF</span>
                                                <span className="bg-white px-3 py-1 rounded-lg border border-gray-100 text-[10px] font-bold text-gray-400 uppercase">DOCX</span>
                                            </div>
                                        </label>
                                    )}
                                </div>

                                {error && (
                                    <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 text-sm animate-shake">
                                        <AlertCircle size={20} className="shrink-0" />
                                        <span className="font-medium">{error}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 2 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between bg-blue-50/50 text-blue-700 p-4 rounded-xl border border-blue-100">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-600 text-white p-1 rounded-md">
                                                <Check size={16} />
                                            </div>
                                            <span className="font-bold text-sm">Resume Processed: {file?.name}</span>
                                        </div>
                                        <button 
                                            onClick={() => setStep(1)}
                                            className="text-xs font-bold hover:underline"
                                        >Change</button>
                                    </div>

                                    {projectedScore !== null && (
                                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-xl text-white flex items-center justify-between shadow-lg">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Initial AI Match Score</p>
                                                <p className="text-2xl font-black">{projectedScore}%</p>
                                            </div>
                                            <div className="h-12 w-12 rounded-full border-4 border-white/20 flex items-center justify-center relative">
                                                <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin-slow" />
                                                <span className="text-xs font-black">AI</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <ResumePreview 
                                    initialSkills={parsedSkills} 
                                    initialExperience={parsedExperience}
                                    onUpdate={handleUpdateSkills} 
                                />

                                {loading ? (
                                    <div className="flex flex-col items-center py-6 gap-3">
                                        <Loader2 className="text-blue-600 animate-spin" size={32} />
                                        <p className="text-blue-600 font-black text-sm uppercase tracking-widest">Finalizing Application...</p>
                                    </div>
                                ) : success ? (
                                    <div className="text-center py-6 animate-bounce">
                                        <div className="bg-green-100 text-green-700 p-4 rounded-2xl border border-green-200 inline-block font-black">
                                            {success}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 rounded-2xl hover:shadow-xl hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-3 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Confirm & Submit Application <ChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
