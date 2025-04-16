
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import HomePage from '@/pages/HomePage';
import StudySessionPage from '@/pages/StudySessionPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import SettingsPage from '@/pages/SettingsPage';
import CalendarPage from '@/pages/CalendarPage';
import QuizPage from '@/pages/QuizPage';
import TeacherDashboardPage from '@/pages/TeacherDashboardPage';
import ClassroomPage from '@/pages/ClassroomPage';
import StudentProgressPage from '@/pages/StudentProgressPage';
import AthroSelectorPage from '@/pages/athro/AthroSelectorPage';
import AthroSubjectPage from '@/pages/athro/AthroSubjectPage';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { AthroProvider } from '@/contexts/AthroContext';
import WelcomePage from '@/pages/WelcomePage';
import OnboardingPage from '@/pages/OnboardingPage';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AthroProvider>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              <Route path="/home" element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } />
              
              <Route path="/study" element={
                <ProtectedRoute>
                  <StudySessionPage />
                </ProtectedRoute>
              } />
              
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              } />
              
              <Route path="/quiz" element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/teacher-dashboard" element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherDashboardPage />
                </ProtectedRoute>
              } />
              
              <Route path="/classroom/:id" element={
                <ProtectedRoute requiredRole="teacher">
                  <ClassroomPage />
                </ProtectedRoute>
              } />
              
              <Route path="/student/:id" element={
                <ProtectedRoute requiredRole="teacher">
                  <StudentProgressPage />
                </ProtectedRoute>
              } />
              
              <Route path="/athro" element={
                <ProtectedRoute>
                  <AthroSelectorPage />
                </ProtectedRoute>
              } />
              
              <Route path="/athro/:subject" element={
                <ProtectedRoute>
                  <AthroSubjectPage />
                </ProtectedRoute>
              } />
            </Routes>
            <Toaster />
          </div>
        </AthroProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
