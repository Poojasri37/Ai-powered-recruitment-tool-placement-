import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { JobFormPage } from './pages/JobFormPage';
import { CandidateListPage } from './pages/CandidateListPage';
import { CandidateDetailPage } from './pages/CandidateDetailPage';
import { CandidateJobsPage } from './pages/CandidateJobsPage';
import { ApplyJobPage } from './pages/ApplyJobPage';
import { CandidateDashboardPage } from './pages/CandidateDashboardPage';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage';
import { JobApplicationsPage } from './pages/JobApplicationsPage';
import { TalentMatchPage } from './pages/TalentMatchPage';
import InterviewPage from './pages/InterviewPage';
import { CandidateInterviewsPage } from './pages/CandidateInterviewsPage';
import InterviewResultsPage from './pages/InterviewResultsPage';
import ReportsPage from './pages/ReportsPage';
import AddStudentsPage from './pages/AddStudentsPage';
import MockInterviewPage from './pages/MockInterviewPage';
import MockInterviewReportPage from './pages/MockInterviewReportPage';
import Layout from './components/layout/Layout';

import { clearAuth } from './utils/auth';

// Helper: read auth state from localStorage (always fresh)
function getRecruiterAuth() {
  const token = localStorage.getItem('recruiter_token');
  const userStr = localStorage.getItem('recruiter_user');
  const user = userStr ? JSON.parse(userStr) : null;
  return { token, user };
}

function getCandidateAuth() {
  const token = localStorage.getItem('candidate_token');
  const userStr = localStorage.getItem('candidate_user');
  const user = userStr ? JSON.parse(userStr) : null;
  return { token, user };
}

function App() {
  // authVersion is bumped to force re-render when auth state changes
  const [authVersion, setAuthVersion] = useState(0);

  const bumpAuth = () => setAuthVersion(v => v + 1);

  // Listen for localStorage changes from OTHER tabs (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === 'recruiter_token' ||
        e.key === 'recruiter_user' ||
        e.key === 'candidate_token' ||
        e.key === 'candidate_user'
      ) {
        // Auth changed in another tab — force re-render in this tab
        bumpAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Also use BroadcastChannel for same-origin tab communication
  // (storage event doesn't fire in the SAME tab that made the change)
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('recruitai_auth');
      channel.onmessage = (event) => {
        if (event.data?.type === 'AUTH_CHANGE') {
          bumpAuth();
        }
      };
    } catch (e) {
      // BroadcastChannel not supported in some browsers — fallback is storage event
    }
    return () => { channel?.close(); };
  }, []);

  // Notify other tabs about auth changes
  const notifyAuthChange = () => {
    try {
      const channel = new BroadcastChannel('recruitai_auth');
      channel.postMessage({ type: 'AUTH_CHANGE' });
      channel.close();
    } catch (e) {}
  };

  const handleLogin = () => {
    bumpAuth();
    notifyAuthChange();
  };

  const handleLogout = (role: 'recruiter' | 'candidate') => {
    clearAuth(role);
    bumpAuth();
    notifyAuthChange();
  };

  // Route guards — each checks ONLY its own role's token
  const RecruiterRoute = ({ children }: { children: React.ReactNode }) => {
    const { token, user } = getRecruiterAuth();
    if (token && user?.role === 'recruiter') {
      return <Layout onLogout={() => handleLogout('recruiter')}>{children}</Layout>;
    }
    // Redirect to login — NOT to "/" which might auto-redirect to candidate
    return <Navigate to="/login" replace />;
  };

  const CandidateRoute = ({ children }: { children: React.ReactNode }) => {
    const { token, user } = getCandidateAuth();
    if (token && user?.role === 'candidate') {
      return <Layout onLogout={() => handleLogout('candidate')}>{children}</Layout>;
    }
    // Redirect to login — NOT to "/" which might auto-redirect to recruiter
    return <Navigate to="/login" replace />;
  };

  // Root "/" — smart redirect based on what's logged in
  const RootRedirect = () => {
    const recruiter = getRecruiterAuth();
    const candidate = getCandidateAuth();
    const hasRecruiter = !!(recruiter.token && recruiter.user?.role === 'recruiter');
    const hasCandidate = !!(candidate.token && candidate.user?.role === 'candidate');

    // If both are logged in, check page referrer or default to recruiter
    if (hasRecruiter && hasCandidate) {
      // Default to recruiter dashboard (user can switch via sidebar)
      return <Navigate to="/dashboard" replace />;
    }
    if (hasRecruiter) return <Navigate to="/dashboard" replace />;
    if (hasCandidate) return <Navigate to="/candidate-jobs" replace />;
    return <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <Routes>
        {/* Root: smart redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Login page: ALWAYS accessible — key prop forces re-render on authVersion change */}
        <Route
          path="/login"
          element={<LoginPage key={authVersion} onLogin={handleLogin} />}
        />

        {/* Recruiter Routes */}
        <Route path="/dashboard" element={<RecruiterRoute><DashboardPage /></RecruiterRoute>} />
        <Route path="/job-form" element={<RecruiterRoute><JobFormPage /></RecruiterRoute>} />
        <Route path="/candidates/:jobId" element={<RecruiterRoute><CandidateListPage /></RecruiterRoute>} />
        <Route path="/job-applications/:jobId" element={<RecruiterRoute><JobApplicationsPage /></RecruiterRoute>} />
        <Route path="/candidate/:candidateId" element={<RecruiterRoute><CandidateDetailPage /></RecruiterRoute>} />
        <Route path="/application/:appId" element={<RecruiterRoute><ApplicationDetailPage /></RecruiterRoute>} />
        <Route path="/talent-match" element={<RecruiterRoute><TalentMatchPage /></RecruiterRoute>} />
        <Route path="/reports" element={<RecruiterRoute><ReportsPage /></RecruiterRoute>} />
        <Route path="/add-students" element={<RecruiterRoute><AddStudentsPage /></RecruiterRoute>} />
        <Route path="/interview-results/:sessionId" element={<RecruiterRoute><InterviewResultsPage /></RecruiterRoute>} />

        {/* Candidate Routes */}
        <Route path="/candidate-jobs" element={<CandidateRoute><CandidateJobsPage /></CandidateRoute>} />
        <Route path="/apply/:jobId" element={<CandidateRoute><ApplyJobPage /></CandidateRoute>} />
        <Route path="/candidate-dashboard" element={<CandidateRoute><CandidateDashboardPage /></CandidateRoute>} />
        <Route path="/interview/:sessionId" element={<CandidateRoute><InterviewPage /></CandidateRoute>} />
        <Route path="/candidate-interviews-complete" element={<CandidateRoute><CandidateInterviewsPage /></CandidateRoute>} />
        <Route path="/mock-interview" element={<CandidateRoute><MockInterviewPage /></CandidateRoute>} />
        <Route path="/mock-interview-report" element={<CandidateRoute><MockInterviewReportPage /></CandidateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
