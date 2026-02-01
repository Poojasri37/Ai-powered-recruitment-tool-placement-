import React, { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface ResumeUploadProps {
  jobId: string;
  onSuccess?: () => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ jobId, onSuccess }) => {
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
      formData.append('jobId', jobId);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/candidates/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess('Resume uploaded successfully!');
      setFile(null);
      setTimeout(() => onSuccess?.(), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {file && <p className="text-sm text-gray-600">Selected: {file.name}</p>}

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success && <div className="text-green-600 text-sm font-semibold">{success}</div>}

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          {loading ? 'Uploading...' : 'Upload Resume'}
        </button>
      </form>
    </div>
  );
};

export default ResumeUpload;
