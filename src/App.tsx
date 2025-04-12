import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { StudentRecordProvider } from "./contexts/StudentRecordContext";
import { AthroProvider } from "./contexts/AthroContext";
import NotFound from "./pages/NotFound";
import AthroSystem from "./components/AthroSystem";

// Pages
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import StudySessionPage from "./pages/StudySessionPage";
import CalendarPage from "./pages/CalendarPage";
import QuizPage from "./pages/QuizPage";
import SettingsPage from "./pages/SettingsPage";
import TeacherDashboardPage from "./pages/TeacherDashboardPage";
import FilesPage from "./pages/FilesPage";
import AthroPage from "./pages/AthroPage";
import AssignmentsPage from './pages/AssignmentsPage';
import AssignmentSubmission from './components/assignment/AssignmentSubmission';
import TeacherAssignPage from './pages/teacher/TeacherAssignPage';

// Lazy-loaded Pages
const AthroMathsPage = React.lazy(() => import('./pages/athro/AthroMathsPage'));

// Teacher dashboard pages
import TeacherSetsPage from "./pages/teacher/TeacherSetsPage";
import TeacherMarkingPage from "./pages/teacher/TeacherMarkingPage";
import TeacherStudentProfilesPage from "./pages/teacher/TeacherStudentProfilesPage";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import Navigation from "./components/Navigation";
import TeacherDashboardLayout from "./components/dashboard/TeacherDashboardLayout";

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <StudentRecordProvider>
        <AthroProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="flex flex-col min-h-screen">
                <Routes>
                  <Route path="/" element={<WelcomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  
                  {/* Student Protected Routes */}
                  <Route path="/home" element={
                    <ProtectedRoute>
                      {({ user }) => user?.role === 'teacher' ? 
                        <Navigate to="/teacher-dashboard" /> : 
                        <>
                          <Navigation />
                          <HomePage />
                          <AthroSystem />
                        </>
                      }
                    </ProtectedRoute>
                  } />
                  <Route path="/study" element={
                    <ProtectedRoute>
                      {({ user }) => user?.role === 'teacher' ? 
                        <Navigate to="/teacher-dashboard" /> : 
                        <>
                          <Navigation />
                          <StudySessionPage />
                          <AthroSystem />
                        </>
                      }
                    </ProtectedRoute>
                  } />
                  
                  {/* Athro Routes */}
                  <Route path="/athro" element={<AthroPage />} />
                  <Route path="/athro/mathematics" element={
                    <ProtectedRoute>
                      {({ user }) => (
                        <>
                          <Navigation />
                          <Suspense fallback={<div>Loading...</div>}>
                            <AthroMathsPage />
                          </Suspense>
                          <AthroSystem />
                        </>
                      )}
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/calendar" element={
                    <ProtectedRoute>
                      {({ user }) => user?.role === 'teacher' ? 
                        <Navigate to="/teacher-dashboard" /> : 
                        <>
                          <Navigation />
                          <CalendarPage />
                          <AthroSystem />
                        </>
                      }
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/quiz" element={
                    <ProtectedRoute>
                      {({ user }) => user?.role === 'teacher' ? 
                        <Navigate to="/teacher-dashboard" /> : 
                        <>
                          <Navigation />
                          <QuizPage />
                          <AthroSystem />
                        </>
                      }
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      {({ user }) => 
                        <>
                          <Navigation />
                          <SettingsPage />
                          {user?.role !== 'teacher' && <AthroSystem />}
                        </>
                      }
                    </ProtectedRoute>
                  } />
                  
                  {/* Teacher Dashboard Main Route */}
                  <Route path="/teacher-dashboard" element={
                    <ProtectedRoute>
                      <TeacherDashboardPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Teacher Dashboard Sub-Routes */}
                  <Route path="/teacher/:section" element={
                    <ProtectedRoute>
                      {({ user }) => 
                        user?.role === 'teacher' ? 
                          <TeacherDashboardLayout /> : 
                          <Navigate to="/home" />
                      }
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/files" element={
                    <ProtectedRoute>
                      <>
                        <Navigation />
                        <FilesPage />
                        <AthroSystem />
                      </>
                    </ProtectedRoute>
                  } />
                  
                  {/* Catch-all Route */}
                  <Route path="*" element={<NotFound />} />
                  
                  {/* Add these new routes */}
                  <Route 
                    path="/assignments" 
                    element={
                      <ProtectedRoute>
                        <AssignmentsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/assignment/:id" 
                    element={
                      <ProtectedRoute>
                        <AssignmentSubmission />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/teacher/assign" 
                    element={
                      <ProtectedRoute requiredRole="teacher">
                        <TeacherAssignPage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </AthroProvider>
      </StudentRecordProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
