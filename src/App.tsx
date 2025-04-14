
import React, { useEffect, useState } from "react";
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

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setReady(true), 1000);
    return () => clearTimeout(timeout);
  }, []);

  if (!ready) {
    return (
      <div style={{
        backgroundColor: "#000",
        color: "#00ff00",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "2rem"
      }}>
        ✅ App layout is loading...
      </div>
    );
  }

  return (
    <AuthProvider>
      <StudentClassProvider>
        <StudentRecordProvider>
          <AthroProvider>
            <Routes>
              <Route path="/" element={<IndexPage />} />
              <Route path="/home" element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/athro/*"
                element={
                  <ProtectedRoute>
                    <AthroPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz"
                element={
                  <ProtectedRoute>
                    <QuizPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/*"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/license-required" element={<LicenseRequiredPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AthroSystem />
            <Toaster />
          </AthroProvider>
        </StudentRecordProvider>
      </StudentClassProvider>
    </AuthProvider>
  );
}
