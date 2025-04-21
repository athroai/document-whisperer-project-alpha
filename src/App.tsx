import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import Dashboard from '@/pages/Dashboard';
import CalendarPage from '@/pages/CalendarPage';
import OnboardingPage from '@/pages/OnboardingPage';
import { AuthProvider } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { withOnboardingGuard } from '@/utils/onboardingGuard';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SettingsPage from './pages/SettingsPage';
import WelcomePage from './pages/WelcomePage';
import PomodoroPage from './pages/PomodoroPage';
import AthroChat from './pages/AthroChat';
import StudyPage from './pages/StudyPage';

const ProtectedCalendarPage = withOnboardingGuard(CalendarPage);
const ProtectedDashboard = withOnboardingGuard(Dashboard);

const App = () => {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedDashboard />} />
            <Route path="/calendar" element={<ProtectedCalendarPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/pomodoro" element={<PomodoroPage />} />
            <Route path="/athro-chat" element={<AthroChat />} />
            <Route path="/study" element={<StudyPage />} />
          </Routes>
          <Toaster />
        </Router>
      </OnboardingProvider>
    </AuthProvider>
  );
};

export default App;
