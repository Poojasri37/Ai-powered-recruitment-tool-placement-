import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, CheckCircle, AlertTriangle, Lightbulb, Star, TrendingUp, MessageSquare, Code, Brain } from 'lucide-react';

interface QuestionAnalysis {
  question: string;
  answer: string;
  score: number;
  communicationFeedback: string;
  technicalFeedback: string;
  improvementTips: string;
}

interface MockReport {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  summary: string;
  questionAnalysis: QuestionAnalysis[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export default function MockInterviewReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { report, duration, jobTitle } = (location.state as { report: MockReport; duration: number; jobTitle: string }) || {};

  if (!report) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Report Data</h2>
          <p className="text-gray-600 mb-4">Please complete a mock interview first.</p>
          <button onClick={() => navigate('/mock-interview')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Start Mock Interview
          </button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-600';
  };

  const downloadReport = () => {
    let text = `MOCK INTERVIEW PERFORMANCE REPORT\n${'='.repeat(50)}\n\n`;
    text += `Position: ${jobTitle}\nDate: ${new Date().toLocaleDateString()}\n`;
    text += `Duration: ${Math.floor(duration / 60)} min ${duration % 60} sec\n\n`;
    text += `SCORES\n${'-'.repeat(30)}\n`;
    text += `Overall: ${report.overallScore}%\n`;
    text += `Communication: ${report.communicationScore}%\n`;
    text += `Technical: ${report.technicalScore}%\n`;
    text += `Confidence: ${report.confidenceScore}%\n\n`;
    text += `SUMMARY\n${'-'.repeat(30)}\n${report.summary}\n\n`;
    text += `STRENGTHS\n${'-'.repeat(30)}\n`;
    report.strengths.forEach((s, i) => text += `${i + 1}. ${s}\n`);
    text += `\nWEAKNESSES\n${'-'.repeat(30)}\n`;
    report.weaknesses.forEach((w, i) => text += `${i + 1}. ${w}\n`);
    text += `\nRECOMMENDATIONS\n${'-'.repeat(30)}\n`;
    report.recommendations.forEach((r, i) => text += `${i + 1}. ${r}\n`);
    text += `\nDETAILED QUESTION ANALYSIS\n${'='.repeat(50)}\n`;
    report.questionAnalysis.forEach((qa, i) => {
      text += `\nQ${i + 1}: ${qa.question}\nAnswer: ${qa.answer}\nScore: ${qa.score}%\n`;
      text += `Communication: ${qa.communicationFeedback}\nTechnical: ${qa.technicalFeedback}\nTips: ${qa.improvementTips}\n`;
    });

    const el = document.createElement('a');
    el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    el.setAttribute('download', `mock_interview_report_${new Date().toISOString().split('T')[0]}.txt`);
    el.style.display = 'none';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button onClick={() => navigate('/mock-interview')} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2">
              <ArrowLeft size={14} /> Back to Mock Interview
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Mock Interview Report</h1>
            <p className="text-gray-500 mt-1">{jobTitle} • {Math.floor(duration / 60)} min {duration % 60} sec</p>
          </div>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg shadow-blue-500/30 transition-all"
          >
            <Download size={18} /> Download Report
          </button>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Overall', score: report.overallScore, icon: Star },
            { label: 'Communication', score: report.communicationScore, icon: MessageSquare },
            { label: 'Technical', score: report.technicalScore, icon: Code },
            { label: 'Confidence', score: report.confidenceScore, icon: Brain },
          ].map(({ label, score, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 text-center">
              <Icon className={`w-6 h-6 mx-auto mb-2 ${getScoreColor(score)}`} />
              <p className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}%</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className={`bg-gradient-to-r ${getScoreBg(report.overallScore)} text-white rounded-2xl p-6 mb-8 shadow-lg`}>
          <h2 className="text-lg font-bold mb-2">Overall Assessment</h2>
          <p className="text-white/90">{report.summary}</p>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" /> Strengths
            </h3>
            <ul className="space-y-2">
              {report.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" /> Areas to Improve
            </h3>
            <ul className="space-y-2">
              {report.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-yellow-500 mt-0.5">⚠</span> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-600" /> AI Recommendations
          </h3>
          <ul className="space-y-3">
            {report.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-blue-800">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Per-question Analysis */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" /> Question-by-Question Analysis
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {report.questionAnalysis.map((qa, index) => (
              <div key={index} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-500">Question {index + 1}</p>
                    <p className="text-base font-medium text-gray-900 mt-1">{qa.question}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                    qa.score >= 80 ? 'bg-green-100 text-green-700' :
                    qa.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {qa.score}%
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700 mb-1 font-medium">Your Answer:</p>
                  <p className="text-sm text-gray-600">{qa.answer}</p>
                </div>

                <div className="grid gap-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-blue-700 uppercase">Communication</p>
                      <p className="text-sm text-gray-600">{qa.communicationFeedback}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Code className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-purple-700 uppercase">Technical Accuracy</p>
                      <p className="text-sm text-gray-600">{qa.technicalFeedback}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-yellow-700 uppercase">How to Improve</p>
                      <p className="text-sm text-gray-600">{qa.improvementTips}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retry Button */}
        <div className="text-center pb-8">
          <button
            onClick={() => navigate('/mock-interview')}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/30 transition-all"
          >
            Start Another Mock Interview
          </button>
        </div>
      </div>
    </div>
  );
}
