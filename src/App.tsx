
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
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
import AthroOnboardingPage from './pages/AthroOnboardingPage';

const ProtectedCalendarPage = withOnboardingGuard(CalendarPage);

const App = () => {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/calendar" replace />} />
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/calendar" element={<ProtectedCalendarPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/athro-onboarding" element={<AthroOnboardingPage />} />
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
