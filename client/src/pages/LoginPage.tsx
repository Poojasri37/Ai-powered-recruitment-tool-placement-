import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Sparkles, Building2, UserCircle } from 'lucide-react';
import { API_URL } from '../config';

interface LoginPageProps {
  onLogin?: (token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'recruiter' | 'candidate'>('recruiter');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { ...formData, role: userType };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Authentication failed');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin?.(data.token);
      navigate(data.user.role === 'recruiter' ? '/dashboard' : '/candidate-jobs');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-background">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 -z-20" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] -z-10 animate-pulse-slow" />

      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">

        {/* Left Side - Hero Content (Hidden on mobile) */}
        <div className="hidden md:block p-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Recruit AI
            </h1>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            The Future of <br />
            <span className="text-primary">Smart Recruitment</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md">
            Streamline your hiring process with AI-driven insights, automated scheduling, and intelligent candidate matching.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm">
              <Building2 className="w-6 h-6 text-blue-500 mb-2" />
              <h3 className="font-semibold text-gray-900">For Recruiters</h3>
              <p className="text-sm text-gray-500">Automate screening & interviews</p>
            </div>
            <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm">
              <UserCircle className="w-6 h-6 text-purple-500 mb-2" />
              <h3 className="font-semibold text-gray-900">For Candidates</h3>
              <p className="text-sm text-gray-500">Fast-track your dream job</p>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Card */}
        <div className="w-full max-w-md mx-auto">
          <div className="relative bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 overflow-hidden animate-fade-in">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500" />

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-gray-500 text-sm">
                {isLogin
                  ? 'Enter your credentials to access your account'
                  : 'Join thousands of professionals today'
                }
              </p>
            </div>

            {/* Role Selection (Only for Register) */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-gray-100/50 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUserType('recruiter')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${userType === 'recruiter'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Building2 size={16} /> Recruiter
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('candidate')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${userType === 'candidate'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <UserCircle size={16} /> Candidate
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none"
                      placeholder="John Doe"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center justify-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 transform transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="text-primary font-semibold hover:text-blue-700 transition-colors ml-1"
                >
                  {isLogin ? 'Register Now' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
