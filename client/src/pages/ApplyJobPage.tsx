import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ApplyJobPage: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/candidate-jobs/${jobId}/apply`, {
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
        <Link to="/candidate-jobs" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft size={20} /> Back to Jobs
        </Link>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Apply to Job</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto text-gray-400 mb-2" size={32} />
              <label className="block">
                <span className="sr-only">Choose resume</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">PDF or DOCX (Max 5MB)</p>
            </div>

            {file && <p className="text-sm text-gray-600">Selected: <strong>{file.name}</strong></p>}

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            {success && <div className="text-green-600 text-sm font-semibold">{success}</div>}

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
