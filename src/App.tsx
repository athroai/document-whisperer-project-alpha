
import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import CalendarPage from '@/pages/CalendarPage';
import OnboardingPage from '@/pages/OnboardingPage';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import Navigation from '@/components/Navigation';

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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { state } = useAuth();
  
  React.useEffect(() => {
    if (!state.isLoading && !state.user) {
      navigate('/login', { replace: true });
    }
  }, [state.isLoading, state.user, navigate]);
  
  if (state.isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-t-purple-600 border-r-transparent border-b-purple-600 border-l-transparent rounded-full"></div>
    </div>;
  }
  
  return state.user ? <>{children}</> : null;
};

const App = () => {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/dashboard" element={<Navigate to="/home" replace />} />
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
              <Route path="/home" element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
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
    </AuthProvider>
  );
};

export default App;
