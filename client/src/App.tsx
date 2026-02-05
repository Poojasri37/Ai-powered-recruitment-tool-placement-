import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Layout from './components/layout/Layout';

import { clearAuth, getAuthToken, getAuthUser } from './utils/auth';

function App() {
  const [authTrigger, setAuthTrigger] = useState(0);

  const handleLogin = () => {
    setAuthTrigger(prev => prev + 1);
  };

  const handleLogout = (role: 'recruiter' | 'candidate') => {
    clearAuth(role);
    setAuthTrigger(prev => prev + 1);
  };

  const RecruiterRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('recruiter_token');
    const userStr = localStorage.getItem('recruiter_user');
    const user = userStr ? JSON.parse(userStr) : null;

    return token && user?.role === 'recruiter' ? (
      <Layout onLogout={() => handleLogout('recruiter')}>{children}</Layout>
    ) : (
      <Navigate to="/" />
    );
  };

  const CandidateRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem('candidate_token');
    const userStr = localStorage.getItem('candidate_user');
    const user = userStr ? JSON.parse(userStr) : null;

    return token && user?.role === 'candidate' ? (
      <Layout onLogout={() => handleLogout('candidate')}>{children}</Layout>
    ) : (
      <Navigate to="/" />
    );
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            localStorage.getItem('recruiter_token') ? (
              <Navigate to="/dashboard" />
            ) : localStorage.getItem('candidate_token') ? (
              <Navigate to="/candidate-jobs" />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
        {/* Recruiter Routes */}
        <Route
          path="/dashboard"
          element={
            <RecruiterRoute>
              <DashboardPage />
            </RecruiterRoute>
          }
        />
        <Route
          path="/job-form"
          element={
            <RecruiterRoute>
              <JobFormPage />
            </RecruiterRoute>
          }
        />
        <Route
          path="/candidates/:jobId"
          element={
            <RecruiterRoute>
              <CandidateListPage />
            </RecruiterRoute>
          }
        />
        <Route
          path="/job-applications/:jobId"
          element={
            <RecruiterRoute>
              <JobApplicationsPage />
            </RecruiterRoute>
          }
        />
        <Route
          path="/candidate/:candidateId"
          element={
            <RecruiterRoute>
              <CandidateDetailPage />
            </RecruiterRoute>
          }
        />
        <Route
          path="/application/:appId"
          element={
            <RecruiterRoute>
              <ApplicationDetailPage />
            </RecruiterRoute>
          }
        />
        <Route
          path="/talent-match"
          element={
            <RecruiterRoute>
              <TalentMatchPage />
            </RecruiterRoute>
          }
        />
        {/* Candidate Routes */}
        <Route
          path="/candidate-jobs"
          element={
            <CandidateRoute>
              <CandidateJobsPage />
            </CandidateRoute>
          }
        />
        <Route
          path="/apply/:jobId"
          element={
            <CandidateRoute>
              <ApplyJobPage />
            </CandidateRoute>
          }
        />
        <Route
          path="/candidate-dashboard"
          element={
            <CandidateRoute>
              <CandidateDashboardPage />
            </CandidateRoute>
          }
        />
        {/* Interview Routes */}
        <Route
          path="/interview/:sessionId"
          element={
            <CandidateRoute>
              <InterviewPage />
            </CandidateRoute>
          }
        />
        <Route
          path="/candidate-interviews-complete"
          element={
            <CandidateRoute>
              <CandidateInterviewsPage />
            </CandidateRoute>
          }
        />
        <Route
          path="/interview-results/:sessionId"
          element={
            <RecruiterRoute>
              <InterviewResultsPage />
            </RecruiterRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
