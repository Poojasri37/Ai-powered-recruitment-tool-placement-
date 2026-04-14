import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Briefcase, Mic, MicOff, Send, AlertCircle, CheckCircle, Play, ArrowRight } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { API_URL } from '../config';
import { getAuthToken } from '../utils/auth';

interface MatchedJob {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  matchScore: number;
}

interface Question {
  question: string;
  type: 'behavioral' | 'technical' | 'coding' | 'situational';
}

interface ResponseItem {
  question: string;
  answer: string;
  type: string;
}

type Phase = 'upload' | 'jobs' | 'interview' | 'analyzing';

export default function MockInterviewPage() {
  const navigate = useNavigate();
  const token = getAuthToken();

  // Phase state
  const [phase, setPhase] = useState<Phase>('upload');

  // Upload phase
  const [uploading, setUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [resumeId, setResumeId] = useState('');

  // Jobs phase
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<MatchedJob | null>(null);

  // Interview phase
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [codeAnswer, setCodeAnswer] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [followUpQuestionText, setFollowUpQuestionText] = useState('');
  const [error, setError] = useState('');
  const [interviewDuration, setInterviewDuration] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Camera
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentQuestionIndexRef = useRef(0);
  const questionsRef = useRef<Question[]>([]);
  const isFollowUpRef = useRef(false);
  const followUpTextRef = useRef('');
  const confirmedAnswerRef = useRef('');

  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    isFollowUpRef.current = isFollowUp;
  }, [isFollowUp]);

  useEffect(() => {
    followUpTextRef.current = followUpQuestionText;
  }, [followUpQuestionText]);

  // Re-attach camera stream whenever the video element changes (e.g. phase/interviewStarted changes)
  useEffect(() => {
    if (videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch(() => {});
    }
  });

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
      if (recognitionRef.current) recognitionRef.current.stop();
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  // ---- UPLOAD PHASE ----
  const handleUpload = async () => {
    if (!resumeFile) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const res = await fetch(`${API_URL}/api/mock-interview/upload-resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setResumeText(data.resumeText);
      setResumeId(data.resumeId);
      setMatchedJobs(data.matchedJobs || []);
      setPhase('jobs');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // ---- JOBS PHASE ----
  const handleSelectJob = async (job: MatchedJob) => {
    setSelectedJob(job);
    setLoadingQuestions(true);
    setPhase('interview');

    try {
      const res = await fetch(`${API_URL}/api/mock-interview/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeText,
          jobTitle: job.title,
          jobDescription: job.description,
          requiredSkills: job.requiredSkills,
        }),
      });

      const data = await res.json();
      if (data.success && data.questions) {
        setQuestions(data.questions);
      } else {
        setQuestions([
          { question: 'Tell me about yourself and your experience.', type: 'behavioral' },
          { question: 'What are your key strengths?', type: 'behavioral' },
          { question: 'Describe a challenging project.', type: 'situational' },
        ]);
      }
    } catch (err) {
      setQuestions([
        { question: 'Tell me about yourself.', type: 'behavioral' },
        { question: 'What technologies do you know?', type: 'technical' },
      ]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // ---- INTERVIEW PHASE ----
  const startMockInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true },
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraEnabled(true);
      setInterviewStarted(true);

      // Speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event: any) => {
          if (window.speechSynthesis.speaking) return; // Prevent AI from hearing itself
          
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) finalTranscript += transcript + ' ';
            else interimTranscript += transcript;
          }
          
          if (finalTranscript) {
             confirmedAnswerRef.current += finalTranscript;
          }
          
          const full = confirmedAnswerRef.current + interimTranscript;
          if (full.trim()) setCurrentAnswer(full.trim());
        };

        recognitionRef.current.onerror = (event: any) => {
          if (event.error === 'no-speech' || event.error === 'aborted') return;
          setIsListening(false);
        };

        recognitionRef.current.onend = () => setIsListening(false);
      }

      // Timer
      durationIntervalRef.current = setInterval(() => {
        setInterviewDuration(prev => prev + 1);
      }, 1000);

      // Speak first question
      setTimeout(() => speakQuestion(0), 1000);
    } catch (err) {
      setError('Failed to access camera/mic. Please check permissions.');
    }
  };

  const interruptAI = () => {
    if (window.speechSynthesis.speaking || isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      startListening();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is typing in code editor or textarea, don't interrupt
      if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.code === 'Space' && isSpeaking) {
        e.preventDefault();
        interruptAI();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpeaking]);

  const generateFollowUp = async (previousQuestion: string, candidateAnswer: string) => {
    try {
      // Zero-latency conversational filler
      const fillers = ["Hmm...", "I see.", "Interesting.", "Got it.", "Alright, let me process that."];
      const filler = fillers[Math.floor(Math.random() * fillers.length)];
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(filler);
      u.onstart = () => setIsSpeaking(true);
      window.speechSynthesis.speak(u);
      const response = await fetch(`${API_URL}/api/mock-interview/follow-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ previousQuestion, candidateAnswer }),
      });
      const data = await response.json();
      if (data.success && data.followUp) {
        setFollowUpQuestionText(data.followUp);
        setIsFollowUp(true);
        // Update refs immediately so speakQuestion reads the correct values
        followUpTextRef.current = data.followUp;
        isFollowUpRef.current = true;
        
        // Remove artificial latency: speak immediately instead of arbitrary 500ms
        speakQuestion(currentQuestionIndexRef.current);
      } else {
        // Fallback: just continue to next question
        const nextIndex = currentQuestionIndexRef.current + 1;
        if (nextIndex < questionsRef.current.length) {
          setCurrentQuestionIndex(nextIndex);
          speakQuestion(nextIndex);
        } else {
          finishMockInterview();
        }
      }
    } catch (err) {
      console.error('Follow up error', err);
      // Fallback: just continue to next question
      const nextIndex = currentQuestionIndexRef.current + 1;
      if (nextIndex < questionsRef.current.length) {
        setCurrentQuestionIndex(nextIndex);
        setTimeout(() => speakQuestion(nextIndex), 1000);
      } else {
        finishMockInterview();
      }
    }
  };

  const speakQuestion = (idx: number) => {
    stopListening();
    if (idx >= questionsRef.current.length) return;

    const questionText = isFollowUpRef.current
      ? followUpTextRef.current
      : questionsRef.current[idx].question;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    setIsSpeaking(true);

    utterance.onend = () => {
      setIsSpeaking(false);
      setTimeout(() => startListening(), 800);
    };

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current || isSpeaking) return;
    setIsListening(true);
    // Reset buffers for the NEW question
    confirmedAnswerRef.current = ''; 
    setCurrentAnswer('');
    try { recognitionRef.current.start(); } catch (e) {}
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    setIsListening(false);
    try { recognitionRef.current.stop(); } catch (e) {}
  };

  const submitAnswer = () => {
    const idx = currentQuestionIndexRef.current;
    const q = questionsRef.current[idx];
    if (!q) return;
    stopListening();

    const isCoding = q.type === 'coding';
    const answer = isCoding ? codeAnswer : currentAnswer;

    if (!answer.trim()) {
      setError('Please provide an answer before continuing.');
      return;
    }

    setError('');

    if (isFollowUp) {
      // Save follow-up answer
      setResponses(prev => [
        ...prev,
        { question: followUpQuestionText, answer, type: q.type },
      ]);

      setIsFollowUp(false);
      setFollowUpQuestionText('');
      isFollowUpRef.current = false;
      followUpTextRef.current = '';
      setCurrentAnswer('');
      setCodeAnswer('');

      const nextIndex = idx + 1;
      if (nextIndex < questionsRef.current.length) {
        setCurrentQuestionIndex(nextIndex);
        setTimeout(() => speakQuestion(nextIndex), 1000);
      } else {
        finishMockInterview();
      }
      return;
    }

    // Save normal answer
    setResponses(prev => [...prev, { question: q.question, answer, type: q.type }]);

    // Ask follow-up for non-coding questions. Send to backend and let AI decide.
    if (q.type !== 'coding' && !isFollowUpRef.current) {
      generateFollowUp(q.question, answer);
      return;
    }

    setCurrentAnswer('');
    setCodeAnswer('');

    const nextIndex = idx + 1;
    if (nextIndex < questionsRef.current.length) {
      setCurrentQuestionIndex(nextIndex);
      setTimeout(() => speakQuestion(nextIndex), 1000);
    } else {
      finishMockInterview();
    }
  };

  const finishMockInterview = async () => {
    // Stop everything
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    stopListening();
    window.speechSynthesis.cancel();

    setPhase('analyzing');

    try {
      const res = await fetch(`${API_URL}/api/mock-interview/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ responses, resumeText }),
      });

      const data = await res.json();
      if (data.success && data.report) {
        navigate('/mock-interview-report', { state: { report: data.report, duration: interviewDuration, jobTitle: selectedJob?.title || 'Mock Interview' } });
      } else {
        setError('Failed to generate report');
        setPhase('interview');
      }
    } catch (err) {
      setError('Analysis failed. Please try again.');
      setPhase('interview');
    }
  };

  // ---- RENDER ----
  if (phase === 'upload') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 text-white mb-4">
              <Mic className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Mock Interview</h1>
            <p className="mt-2 text-gray-600">Practice your interview skills with AI-powered feedback</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" /> Step 1: Upload Your Resume
            </h2>
            <p className="text-sm text-gray-500 mb-6">Upload your resume (PDF or DOCX) and we'll match you with relevant jobs and generate personalized interview questions.</p>

            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                resumeFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'
              }`}
            >
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="hidden"
                id="resume-upload"
              />
              <label htmlFor="resume-upload" className="cursor-pointer">
                {resumeFile ? (
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-medium">{resumeFile.name}</span>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">Click to upload your resume</p>
                    <p className="text-xs text-gray-400 mt-1">PDF or DOCX. Max 5MB</p>
                  </div>
                )}
              </label>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!resumeFile || uploading}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30"
            >
              {uploading ? (
                <span className="animate-pulse">Analyzing resume...</span>
              ) : (
                <>
                  <ArrowRight size={18} /> Upload & Find Matching Jobs
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'jobs') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Matched Jobs</h1>
            <p className="mt-2 text-gray-600">Select a job to practice your mock interview for</p>
          </div>

          {matchedJobs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No matching jobs found</h3>
              <p className="text-gray-500 mb-4">No jobs closely match your resume right now. You can still practice a general interview.</p>
              <button
                onClick={() => handleSelectJob({ _id: 'general', title: 'General Interview', description: 'General software development', requiredSkills: ['Problem Solving', 'Communication'], matchScore: 0 })}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Start General Mock Interview
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {matchedJobs.map(job => (
                <div
                  key={job._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleSelectJob(job)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.requiredSkills.slice(0, 5).map((skill) => (
                          <span key={skill} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4 text-center flex-shrink-0">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-lg font-bold ${
                        job.matchScore >= 80 ? 'bg-green-100 text-green-700' :
                        job.matchScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {job.matchScore}%
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Match</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm">
                      <Play size={14} /> Practice Interview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'analyzing') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Analyzing Your Performance</h2>
          <p className="text-gray-400">Our AI is evaluating your communication, technical skills, and providing detailed feedback...</p>
        </div>
      </div>
    );
  }

  // INTERVIEW PHASE
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Mock Interview</h1>
          <p className="text-gray-400">
            Position: <span className="font-semibold text-white">{selectedJob?.title || 'General'}</span>
            {interviewStarted && (
              <span className="ml-4">
                Duration: <span className="font-mono">{Math.floor(interviewDuration / 60)}:{String(interviewDuration % 60).padStart(2, '0')}</span>
              </span>
            )}
          </p>
        </div>

        {loadingQuestions ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Generating personalized questions from your resume...</p>
            </div>
          </div>
        ) : !interviewStarted ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Camera & Microphone Check</h2>
              <video ref={videoRef} autoPlay playsInline muted className="w-full bg-black rounded-lg mb-6" />
              <button
                onClick={startMockInterview}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Play className="h-5 w-5" /> Start Mock Interview
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Mock Interview Instructions</h2>
              <ul className="space-y-3 text-gray-300">
                <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>You will be asked {questions.length} questions based on your resume</span></li>
                <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>2 coding questions with language switching</span></li>
                <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>After completion, you'll receive a detailed AI report</span></li>
                <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>Report includes: Communication, Technical, and Confidence scores</span></li>
                <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" /><span>Each question gets individual analysis with improvement tips</span></li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video bg-black" />
                <div className="p-4">
                  <button
                    onClick={() => {
                      if (isListening) stopListening();
                      else startListening();
                    }}
                    className={`w-full py-2 rounded flex items-center justify-center gap-2 font-semibold transition-colors ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                  >
                    {isListening ? <><MicOff className="h-5 w-5" /> Stop Listening</> : <><Mic className="h-5 w-5" /> Start Listening</>}
                  </button>
                </div>
              </div>

              <div className="mt-4 bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">
                  Question {currentQuestionIndex + 1} of {questions.length} {isFollowUp ? <span className="text-blue-400 font-semibold">(Follow-up)</span> : ''}
                </p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                </div>
              </div>
            </div>

            {/* Q&A */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg p-6">
                {/* Status */}
                <div className="text-center mb-4">
                  {isSpeaking && (
                    <div className="flex flex-col items-center gap-2 mb-2">
                       <p className="text-yellow-400 text-sm font-semibold animate-pulse">🔊 AI is speaking...</p>
                       <button onClick={interruptAI} className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-1 rounded-full text-xs font-semibold transition-all shadow-sm">
                         ✋ Interrupt (Press Space)
                       </button>
                    </div>
                  )}
                  {isListening && <p className="text-green-400 text-sm font-semibold flex items-center justify-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Listening to your answer...</p>}
                  {!isSpeaking && !isListening && <p className="text-gray-400 text-sm">Ready</p>}
                </div>

                {/* Question */}
                <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-purple-600 text-sm rounded-full">{questions[currentQuestionIndex]?.type?.toUpperCase()}</span>
                    {isFollowUp && <span className="px-3 py-1 bg-blue-500 text-sm rounded-full">FOLLOW-UP</span>}
                  </div>
                  <h2 className="text-xl font-semibold">
                    {isFollowUp ? followUpQuestionText : questions[currentQuestionIndex]?.question}
                  </h2>
                  {isFollowUp && (
                    <p className="text-purple-400 mt-3 text-sm font-semibold">
                      ✨ AI Follow Up — probing deeper into your previous answer
                    </p>
                  )}
                </div>

                {/* Answer */}
                {questions[currentQuestionIndex]?.type === 'coding' ? (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium">Your Code:</label>
                      <select
                        value={codeLanguage}
                        onChange={(e) => setCodeLanguage(e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded text-sm text-white p-1"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="csharp">C#</option>
                      </select>
                    </div>
                    <Editor
                      height="300px"
                      language={codeLanguage}
                      value={codeAnswer}
                      onChange={(v) => setCodeAnswer(v || '')}
                      theme="vs-dark"
                      options={{ minimap: { enabled: false }, lineNumbers: 'on', scrollBeyondLastLine: false }}
                    />
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Your Answer:</label>
                      {isListening && <span className="text-xs text-green-400 font-semibold flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>Transcribing...</span>}
                    </div>
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Speak or type your answer here..."
                      className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}

                {/* Voice Controls */}
                {questions[currentQuestionIndex]?.type !== 'coding' && (
                  <div className="mb-6 flex gap-2">
                    <button onClick={startListening} disabled={isListening} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-semibold text-sm">🎤 Start Speaking</button>
                    <button onClick={stopListening} disabled={!isListening} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg font-semibold text-sm">⏹️ Stop Speaking</button>
                    <button onClick={() => speakQuestion(currentQuestionIndex)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-sm">🔊 Repeat</button>
                  </div>
                )}

                {error && (
                  <div className="mb-4 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} /> <p className="text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={submitAnswer} className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold flex items-center justify-center gap-2">
                    <Send className="h-5 w-5" /> {currentQuestionIndex === questions.length - 1 ? 'Finish & Get Report' : 'Next Question'}
                  </button>
                  <button
                    onClick={() => {
                      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
                      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
                      stopListening();
                      window.speechSynthesis.cancel();
                      setInterviewStarted(false);
                      setPhase('jobs');
                    }}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
                  >
                    Exit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
