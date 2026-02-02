import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, ArrowLeft, Check, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResumePreview } from '../components/candidate/ResumePreview';
import { API_URL } from '../config';

export const ApplyJobPage: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step State
  const [step, setStep] = useState(1);
  const [parsedSkills, setParsedSkills] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Simulate Parse
      setTimeout(() => {
        setParsedSkills(['React', 'JavaScript', 'Tailwind', 'Node.js']); // Mock detected skills
        setStep(2);
      }, 800);
    }
  };

  const handleUpdateSkills = (updatedSkills: string[]) => {
    setParsedSkills(updatedSkills);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      // In a real app we would send the curated skills too
      // formData.append('skills', JSON.stringify(parsedSkills));
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/candidate-jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Application failed');
      }

      setSuccess(`Application submitted! Match Score: ${data.matchScore}%`);
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
        <div className="flex items-center mb-8 gap-4">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <h1 className="text-2xl font-bold">Apply Now</h1>
            <p className="text-blue-100 text-sm mt-1">{step === 1 ? 'Upload your resume to get started' : 'Review and enhance your skills'}</p>
          </div>

          <div className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-blue-400 transition-colors bg-gray-50 group">
                  <div className="bg-white w-16 h-16 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="text-blue-600" size={28} />
                  </div>
                  <label className="block cursor-pointer">
                    <span className="sr-only">Choose resume</span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.docx"
                      className="hidden"
                      id="resume-upload"
                    />
                    <span className="block text-lg font-semibold text-gray-700 mb-1">Click to Upload Resume</span>
                    <span className="block text-sm text-gray-500">PDF or DOCX (Max 5MB)</span>
                  </label>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                    <AlertCircle size={18} /> {error}
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 bg-green-50 text-green-700 p-4 rounded-lg">
                  <Check size={20} />
                  <span className="font-semibold text-sm">Resume uploaded: {file?.name}</span>
                </div>

                <ResumePreview initialSkills={parsedSkills} onUpdate={handleUpdateSkills} />

                {loading ? (
                  <div className="text-center py-4 text-blue-600 font-bold animate-pulse">Analyzing match score...</div>
                ) : success ? (
                  <div className="text-center py-4 text-green-600 font-bold text-lg">{success}</div>
                ) : (
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-lg border border-gray-200"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                    >
                      Submit Application <ChevronRight size={18} />
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

