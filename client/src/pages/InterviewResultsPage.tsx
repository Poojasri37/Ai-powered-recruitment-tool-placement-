import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Share2, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';
import { getAuthToken } from '../utils/auth';

interface InterviewResult {
  sessionId: string;
  candidateName: string;
  jobTitle: string;
  results: {
    score: number;
    summary: string;
    responses: Array<{
      question: string;
      answer: string;
      type: string;
      aiEvaluation: string;
    }>;
    codeSubmissions: Array<{
      language: string;
      code: string;
      output: string;
    }>;
    transcript: string;
    duration: number;
  };
}

export default function InterviewResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = getAuthToken();

  useEffect(() => {
    fetchResults();
  }, [sessionId]);

  const fetchResults = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/interviews/results/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Failed to load results');

      const data = await response.json();
      setResults(data.data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results');
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!results) return;

    const reportContent = `
INTERVIEW EVALUATION REPORT
====================================

Candidate: ${results.candidateName}
Position: ${results.jobTitle}
Date: ${new Date().toLocaleDateString()}

OVERALL SCORE: ${results.results.score}/100

SUMMARY:
${results.results.summary}

INTERVIEW RESPONSES:
${results.results.responses.map((r, i) => `
${i + 1}. [${r.type.toUpperCase()}]
Question: ${r.question}
Answer: ${r.answer}
AI Evaluation: ${r.aiEvaluation}
`).join('\n')}

CODE SUBMISSIONS:
${results.results.codeSubmissions.map((c, i) => `
${i + 1}. Language: ${c.language}
\`\`\`${c.language}
${c.code}
\`\`\`
Output: ${c.output}
`).join('\n')}

INTERVIEW DURATION: ${Math.floor(results.results.duration / 60)} minutes ${results.results.duration % 60} seconds

FULL TRANSCRIPT:
${results.results.transcript}
    `;

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(reportContent)
    );
    element.setAttribute('download', `interview_report_${results.candidateName}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading interview results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-800 font-semibold">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!results) return <div className="text-center py-10">No results found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Results</h1>
            <p className="text-gray-600">
              {results.candidateName} • {results.jobTitle}
            </p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <button
              onClick={downloadReport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-5 w-5" />
              Download Report
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors">
              <Share2 className="h-5 w-5" />
              Share
            </button>
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 mb-8">
          <p className="text-blue-100 mb-2">Overall Score</p>
          <p className="text-5xl font-bold mb-2">{results.results.score}%</p>
          <p className="text-blue-100">{results.results.summary}</p>
        </div>

        {/* Responses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Interview Responses</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {results.results.responses.map((response, index) => (
              <div key={index} className="px-6 py-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      {response.type}
                    </p>
                    <p className="text-lg font-medium text-gray-900 mt-1">{response.question}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Candidate's Answer:</p>
                    <p className="text-gray-600 bg-gray-50 rounded p-3 text-sm">{response.answer}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">AI Evaluation:</p>
                    <p className="text-gray-600 bg-blue-50 rounded p-3 text-sm border-l-4 border-blue-500">
                      {response.aiEvaluation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Submissions */}
        {results.results.codeSubmissions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Code Submissions</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {results.results.codeSubmissions.map((submission, index) => (
                <div key={index} className="px-6 py-6">
                  <p className="font-mono text-sm font-semibold text-gray-700 mb-3">
                    Language: {submission.language}
                  </p>
                  <pre className="bg-gray-900 text-gray-100 rounded p-4 overflow-x-auto text-xs mb-4">
                    <code>{submission.code}</code>
                  </pre>
                  <p className="text-sm font-medium text-gray-700 mb-2">Output:</p>
                  <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-sm font-mono">
                    {submission.output}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transcript */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Full Transcript ({Math.floor(results.results.duration / 60)} min)
            </h2>
          </div>
          <div className="px-6 py-6">
            <pre className="bg-gray-50 rounded p-4 text-sm whitespace-pre-wrap font-mono text-gray-700 overflow-x-auto">
              {results.results.transcript}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
