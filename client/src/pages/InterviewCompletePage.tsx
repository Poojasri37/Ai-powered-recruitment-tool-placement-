import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function InterviewCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const score = location.state?.score || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Complete!</h1>

        <p className="text-gray-600 mb-6">
          Thank you for completing the interview. Your responses have been recorded and will be
          evaluated by our team.
        </p>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-8">
          <p className="text-gray-600 text-sm mb-2">Interview Score</p>
          <p className="text-4xl font-bold text-green-600">{score}%</p>
        </div>

        <div className="space-y-3 text-left mb-8 text-sm text-gray-600">
          <p>✓ Your interview session has been submitted</p>
          <p>✓ Your responses are being analyzed by AI</p>
          <p>✓ You'll receive feedback via email within 24 hours</p>
        </div>

        <button
          onClick={() => navigate('/candidate-dashboard')}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          Go to Dashboard
          <ArrowRight className="h-5 w-5" />
        </button>

        <p className="text-gray-500 text-sm mt-6">
          Check your dashboard to track your application status
        </p>
      </div>
    </div>
  );
}
