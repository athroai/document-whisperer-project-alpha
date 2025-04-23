
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";

// Providers
import { AuthProvider } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { AthroProvider } from '@/contexts/AthroContext';

// Components
import Navigation from '@/components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SettingsPage from './pages/SettingsPage';
import PomodoroPage from './pages/PomodoroPage';
import AthroChat from './pages/AthroChat';
import StudyPage from './pages/StudyPage';
import AthroOnboardingPage from './pages/AthroOnboardingPage';
import WelcomePage from './pages/WelcomePage';
import Index from './pages/Index';
import TimekeeperPage from './pages/TimekeeperPage';
import CalendarPage from '@/pages/CalendarPage';
import OnboardingPage from '@/pages/OnboardingPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AthroProvider>
        <OnboardingProvider>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/welcome" element={<WelcomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/dashboard" element={<Navigate to="/home" replace />} />
                
                {/* Protected routes */}
                <Route path="/home" element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                } />
                <Route path="/calendar" element={
                  <ProtectedRoute>
                    <CalendarPage />
                  </ProtectedRoute>
                } />
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                } />
                <Route path="/athro-onboarding" element={
                  <ProtectedRoute>
                    <AthroOnboardingPage />
                  </ProtectedRoute>
                } />
                <Route path="/timekeeper" element={
                  <ProtectedRoute>
                    <TimekeeperPage />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/pomodoro" element={
                  <ProtectedRoute>
                    <PomodoroPage />
                  </ProtectedRoute>
                } />
                <Route path="/athro-chat" element={
                  <ProtectedRoute>
                    <AthroChat />
                  </ProtectedRoute>
                } />
                <Route path="/study" element={
                  <ProtectedRoute>
                    <StudyPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
          </div>
          <Toaster />
        </OnboardingProvider>
      </AthroProvider>
    </AuthProvider>
  );
};

export default App;
