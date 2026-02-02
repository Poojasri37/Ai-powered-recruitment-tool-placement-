import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Mic, MicOff, Send, AlertCircle, CheckCircle } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface SessionData {
  sessionId: string;
  sessionLink: string;
  scheduledTime: string;
  status: string;
  candidate: {
    id: string;
    name: string;
    email: string;
  };
  job: {
    id: string;
    title: string;
    description: string;
    requiredSkills: string[];
  };
  resume: {
    id: string;
    fileName: string;
    parsedData: any;
  };
}

interface Question {
  id: string;
  question: string;
  type: 'behavioral' | 'technical' | 'coding' | 'situational';
  guidance?: string;
}

interface Response {
  question: string;
  answer: string;
  type: 'behavioral' | 'technical' | 'coding' | 'situational';
  aiEvaluation?: string;
}

export default function InterviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [codeAnswer, setCodeAnswer] = useState('');
  // const [showCodeEditor, setShowCodeEditor] = useState(false); // Removed, derived from question type

  // Refs for checking state inside event listeners without closure staleness
  const currentQuestionIndexRef = useRef(0);
  const questionsRef = useRef<Question[]>([]);

  // Keep refs synced with state
  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  const [isRecording, setIsRecording] = useState(false);
  const [interviewDuration, setInterviewDuration] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<any>(null); // Not really used for speech synthesis instance, but kept for consistency
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSessionData();
    // Cleanup on unmount
    return () => {
      stopInterview();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, [sessionId]);

  // Ensure video stream is attached when video element mounts or stream updates
  useEffect(() => {
    if (videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch(e => console.error("Error playing video:", e));
    }
  }, [interviewStarted, cameraEnabled]);

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/interviews/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to load interview session');

      const data = await response.json();
      setSessionData(data.data);
      generateQuestions(data.data.job.id, data.data.job);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
      setLoading(false);
    }
  };

  const generateQuestions = async (jobId: string, jobData: SessionData['job']) => {
    try {
      // Try to get AI-generated questions from backend
      const response = await fetch(`http://localhost:5000/api/interviews/questions/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const aiQuestions: Question[] = data.data.questions.map((q: any, i: number) => ({
          id: String(i + 1),
          question: q.question,
          type: q.type,
          guidance: getGuidance(q.type),
        }));
        setQuestions(aiQuestions);
      } else {
        // Fallback to default questions
        setDefaultQuestions(jobData);
      }
    } catch (err) {
      console.error('Failed to fetch AI questions, using defaults:', err);
      setDefaultQuestions(jobData);
    }
  };

  const setDefaultQuestions = (job: SessionData['job']) => {
    const defaultQuestions: Question[] = [
      {
        id: '1',
        question: `Tell me about your experience with ${job.requiredSkills[0] || 'this role'}`,
        type: 'behavioral',
        guidance: 'Explain your hands-on experience and key achievements',
      },
      {
        id: '2',
        question: 'Describe a challenging project you worked on and how you solved it',
        type: 'behavioral',
        guidance: 'Use the STAR method: Situation, Task, Action, Result',
      },
      {
        id: '3',
        question: `What's your approach to learning new ${job.requiredSkills[1] || 'technologies'}?`,
        type: 'technical',
        guidance: 'Share your learning strategy and recent examples',
      },
      {
        id: '4',
        question: 'How do you handle disagreements with team members or stakeholders?',
        type: 'behavioral',
        guidance: 'Focus on communication and conflict resolution skills',
      },
      {
        id: '5',
        question: 'Explain the concept of RESTful APIs and their constraints',
        type: 'technical',
        guidance: 'Cover the architectural style and key constraints',
      },
      {
        id: '6',
        question: 'What is your process for testing and debugging code?',
        type: 'technical',
        guidance: 'Discuss your testing methodology and tools',
      },
      {
        id: '7',
        question: 'Describe a time you had to optimize a slow-performing application',
        type: 'behavioral',
        guidance: 'Detail the problem, your analysis, and the outcome',
      },
      {
        id: '8',
        question: 'Explain the difference between SQL and NoSQL databases',
        type: 'technical',
        guidance: 'Compare them based on structure, scalability, and use cases',
      },
      {
        id: '9',
        question: 'How do you stay updated with the latest industry trends?',
        type: 'behavioral',
        guidance: 'Mention resources, communities, or practices you follow',
      },
      {
        id: '10',
        question: 'Write a function to reverse a string (language of your choice)',
        type: 'coding',
        guidance: 'Explain your approach before coding, include comments',
      },
    ];
    setQuestions(defaultQuestions);
  };

  const getGuidance = (type: string): string => {
    switch (type) {
      case 'behavioral':
        return 'Use the STAR method: Situation, Task, Action, Result';
      case 'technical':
        return 'Be specific about your knowledge and experience';
      case 'coding':
        return 'Explain your approach, write clean code with comments';
      default:
        return 'Take your time and answer thoughtfully';
    }
  };

  const startInterview = async () => {
    try {
      // Request camera and mic permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true },
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Error playing video:", e));
      }
      setCameraEnabled(true);
      setMicEnabled(true);
      setInterviewStarted(true);

      // Initialize speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true; // Keep listening continuously
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          // Only clear if it's a new question start, otherwise we might clear midway if it restarts
          // setCurrentAnswer(''); 
        };

        recognitionRef.current.onresult = (event: any) => {
          // If the AI is speaking, ignore everything and stop listening
          if (window.speechSynthesis.speaking) {
            recognitionRef.current.stop();
            return;
          }

          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          // Update with final + interim text
          const fullTranscript = finalTranscript || interimTranscript;
          if (fullTranscript.trim()) {
            setCurrentAnswer(prev => {
              // Determine if we should append or replace based on context
              // For simplicity, we'll replace if the new result is comprehensive
              // But better to just set it as the current recognition buffer
              return fullTranscript.trim();
            });
          }

          // Auto-submit logic moved to a manual trigger or more careful silence detection
          // The previous 2s silence detection inside onresult is flaky because onresult fires repeatedly
          // We'll rely on a manual submit or a more robust silence detector if needed.
          // For now, disabling auto-submit to prevent "barge-in" errors and premature skipping
          // Users prefer control over when they are done.
        };

        recognitionRef.current.onerror = (event: any) => {
          if (event.error === 'no-speech') return;
          if (event.error === 'aborted') return;
          console.error('Voice warning:', event.error);
          setIsListening(false);
          // Auto-restart if it wasn't aborted intentionally
          // if (interviewStarted && !isSpeaking) startListening();
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } else {
        console.warn("Speech Recognition API not supported in this browser.");
        setMicEnabled(false);
      }

      // Mark interview as in progress
      await fetch(`http://localhost:5000/api/interviews/${sessionId}/start`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setInterviewDuration((prev) => prev + 1);
      }, 1000);

      // Prevent copy/paste during interview
      const preventCopyPaste = (e: ClipboardEvent) => {
        e.preventDefault();
        setError('Copy-paste is disabled during the interview for security reasons');
      };
      document.addEventListener('copy', preventCopyPaste as any);
      document.addEventListener('paste', preventCopyPaste as any);
      document.addEventListener('cut', preventCopyPaste as any);

      // Speak the first question
      // IMPORTANT: Use the ref to ensure we reference the correct questions array
      setTimeout(() => speakQuestion(0), 1000);
    } catch (err) {
      setError('Failed to access camera/mic. Please check permissions.');
    }
  };

  const speakQuestion = (questionIndex: number) => {
    // Stop listening before AI speaks to prevent echo
    stopListening();

    // Safety check using refs
    if (questionIndex >= questionsRef.current.length) return;

    const question = questionsRef.current[questionIndex];

    // cancel any current speaking
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(question.question);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    setIsSpeaking(true);

    utterance.onend = () => {
      setIsSpeaking(false);
      // Auto-start listening after AI finishes speaking
      // Add a small delay to ensure speaker echo has dissipated
      setTimeout(() => startListening(), 800);
    };

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current || isSpeaking) return;

    setIsListening(true);
    setCurrentAnswer(''); // Reset for new answer segment
    setError('');

    try {
      // recognitionRef.current.abort(); // clear any previous buffer
      recognitionRef.current.start();
    } catch (err) {
      // Ignored: already started
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    setIsListening(false);
    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error('Error stopping speech recognition:', err);
    }
  };

  const stopInterview = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    setCameraEnabled(false);
    setMicEnabled(false);
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    stopListening();
    window.speechSynthesis.cancel();
  };

  const submitAnswer = () => {
    // Always use refs to get the latest state inside callbacks
    const idx = currentQuestionIndexRef.current;
    const currentQuestion = questionsRef.current[idx];

    if (!currentQuestion) return;

    stopListening();

    const isCodingQuestion = currentQuestion.type === 'coding';
    const answer = isCodingQuestion ? codeAnswer : currentAnswer;

    if (!answer.trim()) {
      setError(`Please provide an answer before continuing. ${isCodingQuestion ? 'Type your code' : 'Speak again or type your answer'}.`);
      return;
    }

    // Clear previous error
    setError('');

    setResponses(prev => [
      ...prev,
      {
        question: currentQuestion.question,
        answer,
        type: currentQuestion.type,
      },
    ]);

    // Clear answer
    setCurrentAnswer('');
    setCodeAnswer('');

    // Move to next question using the REF + 1
    const nextIndex = idx + 1;

    if (nextIndex < questionsRef.current.length) {
      setCurrentQuestionIndex(nextIndex);
      // Speak the next question
      setTimeout(() => speakQuestion(nextIndex), 1000);
    } else {
      // Interview complete
      submitInterview();
    }
  };

  const submitInterview = async () => {
    try {
      stopInterview();

      // Calculate score (basic implementation)
      const score = Math.min(100, Math.round((responses.length / questions.length) * 100));

      const interviewResults = {
        score,
        summary: `Completed ${responses.length} out of ${questions.length} questions successfully`,
        responses: responses.map((r) => ({
          ...r,
          aiEvaluation: 'Awaiting AI evaluation...',
        })),
        codeSubmissions: responses
          .filter((r) => r.type === 'coding')
          .map((r) => ({
            language: 'javascript',
            code: r.answer,
            output: 'Code evaluation pending',
          })),
        transcript: responses.map((r) => `Q: ${r.question}\nA: ${r.answer}`).join('\n\n'),
        duration: interviewDuration,
      };

      const response = await fetch(`http://localhost:5000/api/interviews/${sessionId}/submit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(interviewResults),
      });

      if (!response.ok) throw new Error('Failed to submit interview');

      // Redirect to confirmation page
      navigate('/candidate-interviews-complete', { state: { score } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit interview');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading interview session...</p>
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

  if (!sessionData) {
    return <div className="text-center py-10">Session data not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Interview Session</h1>
          <p className="text-gray-300">
            Position: <span className="font-semibold text-white">{sessionData.job.title}</span>
          </p>
          {interviewStarted && (
            <p className="text-gray-400 mt-2">
              Duration: <span className="font-mono">{Math.floor(interviewDuration / 60)}:
                {String(interviewDuration % 60).padStart(2, '0')}</span>
            </p>
          )}
        </div>

        {!interviewStarted ? (
          // Pre-interview setup
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Video Preview */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Camera & Microphone Check</h2>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full bg-black rounded-lg mb-6"
              />
              <button
                onClick={startInterview}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Camera className="h-5 w-5" />
                Start Interview
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Interview Instructions</h2>
              <ul className="space-y-3 text-gray-300">
                <li className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Ensure good lighting and a quiet environment</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>You will be asked {questions.length} questions</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>One question will require you to write code</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Speak clearly and take your time answering</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Your response will be recorded and evaluated</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          // Interview in progress
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Feed */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-video bg-black"
                />
                <div className="p-4 flex gap-2">
                  <button
                    onClick={() => setMicEnabled(!micEnabled)}
                    className={`flex-1 py-2 rounded flex items-center justify-center gap-2 font-semibold transition-colors ${micEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                  >
                    {micEnabled ? (
                      <>
                        <Mic className="h-5 w-5" /> Mic On
                      </>
                    ) : (
                      <>
                        <MicOff className="h-5 w-5" /> Mic Off
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Question Progress */}
              <div className="mt-4 bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Question & Answer Area */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg p-6">
                {/* AI Robot Avatar */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-40">
                    {/* Robot Head */}
                    <div className="bg-gradient-to-b from-blue-400 to-blue-500 rounded-lg w-full h-24 flex items-center justify-center relative">
                      {/* Eyes */}
                      <div className="flex gap-4 absolute top-6">
                        <div className={`w-4 h-4 rounded-full ${isSpeaking ? 'bg-yellow-300 animate-pulse' : 'bg-white'}`}></div>
                        <div className={`w-4 h-4 rounded-full ${isSpeaking ? 'bg-yellow-300 animate-pulse' : 'bg-white'}`}></div>
                      </div>
                      {/* Mouth */}
                      <div className="absolute bottom-3 w-8 h-1 bg-white rounded-full"></div>
                    </div>
                    {/* Robot Body */}
                    <div className="bg-blue-600 w-full h-12 flex items-center justify-center rounded-b-lg">
                      <div className="text-xs text-white font-semibold">AI Interviewer</div>
                    </div>
                    {/* Status indicator */}
                    <div className="absolute -top-2 -right-2">
                      <div className={`w-4 h-4 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : isListening ? 'bg-orange-500 animate-pulse' : 'bg-gray-500'}`}></div>
                    </div>
                  </div>
                </div>

                {/* Status Text */}
                <div className="text-center mb-6">
                  {isSpeaking && <p className="text-yellow-400 text-sm font-semibold">🔊 AI is speaking...</p>}
                  {isListening && <p className="text-green-400 text-sm font-semibold">🎤 Listening to your answer...</p>}
                  {!isSpeaking && !isListening && <p className="text-gray-400 text-sm">Ready for next question</p>}
                </div>

                {/* Question */}
                <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-600 text-sm rounded-full">
                      {questions[currentQuestionIndex]?.type.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold">
                    {questions[currentQuestionIndex]?.question}
                  </h2>
                  {questions[currentQuestionIndex]?.guidance && (
                    <p className="text-gray-400 mt-3 text-sm">
                      💡 Tip: {questions[currentQuestionIndex].guidance}
                    </p>
                  )}
                </div>

                {/* Answer Area */}
                {questions[currentQuestionIndex]?.type === 'coding' ? (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Your Code:</label>
                    <Editor
                      height="300px"
                      defaultLanguage="javascript"
                      value={codeAnswer}
                      onChange={(value) => setCodeAnswer(value || '')}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                      }}
                    />
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium">Your Answer:</label>
                      {isListening && (
                        <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          Transcribing...
                        </span>
                      )}
                    </div>
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      onCopy={(e) => { e.preventDefault(); setError('Copy-paste is disabled during the interview'); }}
                      onPaste={(e) => { e.preventDefault(); setError('Copy-paste is disabled during the interview'); }}
                      onCut={(e) => { e.preventDefault(); setError('Copy-paste is disabled during the interview'); }}
                      placeholder="Speak or type your answer here..."
                      className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Voice Controls */}
                {questions[currentQuestionIndex]?.type !== 'coding' && (
                  <div className="mb-6 flex gap-2">
                    <button
                      onClick={startListening}
                      disabled={isListening}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm"
                    >
                      🎤 Start Speaking
                    </button>
                    <button
                      onClick={stopListening}
                      disabled={!isListening}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm"
                    >
                      ⏹️ Stop Speaking
                    </button>
                    <button
                      onClick={() => speakQuestion(currentQuestionIndex)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm"
                    >
                      🔊 Repeat
                    </button>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={submitAnswer}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <Send className="h-5 w-5" />
                    {currentQuestionIndex === questions.length - 1 ? 'Submit Interview' : 'Next Question'}
                  </button>
                  <button
                    onClick={() => {
                      stopInterview();
                      setInterviewStarted(false);
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
