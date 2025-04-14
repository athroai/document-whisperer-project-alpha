
import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AthroPage from "./pages/AthroPage";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SettingsPage from "./pages/SettingsPage";
import { AthroProvider } from "./contexts/AthroContext";
import { AuthProvider } from "./contexts/AuthContext";
import { StudentClassProvider } from "./contexts/StudentClassContext";
import { StudentRecordProvider } from "./contexts/StudentRecordContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AthroSystem from "./components/AthroSystem";
import LicenseRequiredPage from "./pages/LicenseRequiredPage";
import TeacherDashboardPage from "./pages/TeacherDashboardPage";
import { Toaster } from "./components/ui/toaster";
import QuizPage from "./pages/QuizPage";
import IndexPage from "./pages/Index";
import StudySessionPage from "./pages/StudySessionPage";
import StudySessionRouter from "./pages/study/StudySessionRouter";
import KnowledgePage from './pages/KnowledgePage';
import LoadingSpinner from "./components/ui/loading-spinner";
import CalendarPage from "./pages/CalendarPage";

// Simple loading fallback component
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-screen">
    <LoadingSpinner className="animate-fade-in" size={32} />
  </div>
);

// Add a transition wrapper component for smooth page transitions
const TransitionWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <div className="animate-fade-in">
      {children}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StudentClassProvider>
        <StudentRecordProvider>
          <AthroProvider>
            <Suspense fallback={<LoadingSpinner size={36} className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />}>
              <TransitionWrapper>
                <Routes>
                  <Route path="/" element={<IndexPage />} />
                  <Route path="/home" element={
                    <ProtectedRoute redirectPath="/login">
                      <HomePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route
                    path="/athro/*"
                    element={
                      <ProtectedRoute redirectPath="/login">
                        <AthroPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/quiz"
                    element={
                      <ProtectedRoute redirectPath="/login">
                        <QuizPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute redirectPath="/login">
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/calendar"
                    element={
                      <ProtectedRoute redirectPath="/login">
                        <CalendarPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/teacher/*"
                    element={
                      <ProtectedRoute 
                        requiredRole="teacher" 
                        redirectPath="/login"
                        loadingComponent={<LoadingFallback />}
                      >
                        <TeacherDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/study-session"
                    element={
                      <ProtectedRoute redirectPath="/login">
                        <StudySessionPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/study/*"
                    element={
                      <ProtectedRoute redirectPath="/login">
                        <StudySessionRouter />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/license-required" element={<LicenseRequiredPage />} />
                  <Route path="/knowledge" element={<KnowledgePage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TransitionWrapper>
            </Suspense>
            <AthroSystem />
            <Toaster />
          </AthroProvider>
        </StudentRecordProvider>
      </StudentClassProvider>
    </AuthProvider>
  );
}
