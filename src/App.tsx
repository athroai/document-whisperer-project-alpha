
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotFound from './pages/NotFound';
import FilesPage from './pages/FilesPage';
import AssignmentsPage from './pages/AssignmentsPage';
import QuizPage from './pages/QuizPage';
import SettingsPage from './pages/SettingsPage';
import CalendarPage from './pages/CalendarPage';
import StudySessionPage from './pages/StudySessionPage';
import WelcomePage from './pages/WelcomePage';

// Athro Subject Pages
import AthroSelectorPage from './pages/athro/AthroSelectorPage';
import AthroMathsPage from './pages/athro/AthroMathsPage';
import AthroEnglishPage from './pages/athro/AthroEnglishPage';
import AthroSciencePage from './pages/athro/AthroSciencePage';
import AthroWelshPage from './pages/athro/AthroWelshPage';
import AthroLanguagesPage from './pages/athro/AthroLanguagesPage';
import AthroHistoryPage from './pages/athro/AthroHistoryPage';
import AthroGeographyPage from './pages/athro/AthroGeographyPage';
import AthroREPage from './pages/athro/AthroREPage';

// Student Pages
import StudentHistoryPage from './pages/student/StudentHistoryPage';
import StudentAssignmentsPage from './pages/student/StudentAssignmentsPage';
import StudentAssignmentViewPage from './pages/student/StudentAssignmentViewPage';
import StudentFeedbackPage from './pages/student/StudentFeedbackPage';
import StudentProgressPage from './pages/student/StudentProgressPage';
import StudentResourcesPage from './pages/student/StudentResourcesPage';
import StudyRoutineSetupPage from './pages/student/StudyRoutineSetupPage';
import TimetablePage from './pages/student/TimetablePage';

// Study Pages
import StudyStartPage from './pages/study/StudyStartPage';
import StudyAssignedPage from './pages/study/StudyAssignedPage';
import StudySessionRouter from './pages/study/StudySessionRouter';

// Teacher Pages
import TeacherDashboardPage from './pages/TeacherDashboardPage';
import TeacherSetsPage from './pages/teacher/TeacherSetsPage';
import TeacherMarkingRoute from './pages/teacher/TeacherMarkingRoute';
import TeacherMarkingPanel from './pages/teacher/TeacherMarkingPanel';
import TeacherMarkingPage from './pages/teacher/TeacherMarkingPage';
import TeacherResourceDeployPage from './pages/teacher/TeacherResourceDeployPage';
import TeacherAssignPage from './pages/teacher/TeacherAssignPage';
import TeacherStudentProfilesPage from './pages/teacher/TeacherStudentProfilesPage';
import TeacherParentInquiriesPage from './pages/teacher/TeacherParentInquiriesPage';
import LiveMonitoringPage from './pages/teacher/LiveMonitoringPage';
import TeacherInsightsPage from './pages/teacher/TeacherInsightsPage';
import TeacherAnalyticsPage from './pages/teacher/TeacherAnalyticsPage';
import TeacherSystemToolsPage from './pages/teacher/TeacherSystemToolsPage';

// Admin Pages
import KnowledgeBasePage from './pages/admin/KnowledgeBasePage';

// Components
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import AthroSystem from './components/AthroSystem';
import { Toaster } from '@/components/ui/toaster';

// Contexts
import { useAuth } from './contexts/AuthContext';

function App() {
  const { state } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state.loading) {
      setLoading(false);
    }
  }, [state.loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Navigation />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/welcome" element={<WelcomePage />} />

          {/* Athro Routes */}
          <Route path="/athro" element={<AthroSelectorPage />} />
          <Route path="/athro/maths" element={<AthroMathsPage />} />
          <Route path="/athro/english" element={<AthroEnglishPage />} />
          <Route path="/athro/science" element={<AthroSciencePage />} />
          <Route path="/athro/welsh" element={<AthroWelshPage />} />
          <Route path="/athro/languages" element={<AthroLanguagesPage />} />
          <Route path="/athro/history" element={<AthroHistoryPage />} />
          <Route path="/athro/geography" element={<AthroGeographyPage />} />
          <Route path="/athro/re" element={<AthroREPage />} />

          {/* Student Routes */}
          <Route path="/student" element={<ProtectedRoute requiredRole="student"><StudentHistoryPage /></ProtectedRoute>} />
          <Route path="/student/assignments" element={<ProtectedRoute requiredRole="student"><StudentAssignmentsPage /></ProtectedRoute>} />
          <Route path="/student/assignments/:assignmentId" element={<ProtectedRoute requiredRole="student"><StudentAssignmentViewPage /></ProtectedRoute>} />
          <Route path="/student/feedback" element={<ProtectedRoute requiredRole="student"><StudentFeedbackPage /></ProtectedRoute>} />
          <Route path="/student/progress" element={<ProtectedRoute requiredRole="student"><StudentProgressPage /></ProtectedRoute>} />
          <Route path="/student/resources" element={<ProtectedRoute requiredRole="student"><StudentResourcesPage /></ProtectedRoute>} />
          <Route path="/student/study-routine" element={<ProtectedRoute requiredRole="student"><StudyRoutineSetupPage /></ProtectedRoute>} />
          <Route path="/student/timetable" element={<ProtectedRoute requiredRole="student"><TimetablePage /></ProtectedRoute>} />

          {/* Study Routes */}
          <Route path="/study" element={<ProtectedRoute><StudyStartPage /></ProtectedRoute>} />
          <Route path="/study/assigned/:classId" element={<ProtectedRoute><StudyAssignedPage /></ProtectedRoute>} />
          <Route path="/study/session/:sessionId" element={<ProtectedRoute><StudySessionRouter /></ProtectedRoute>} />

          <Route path="/files" element={<ProtectedRoute><FilesPage /></ProtectedRoute>} />
          <Route path="/assignments" element={<ProtectedRoute><AssignmentsPage /></ProtectedRoute>} />
          <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/study-session" element={<ProtectedRoute><StudySessionPage /></ProtectedRoute>} />

          {/* Teacher Routes */}
          <Route path="/teacher" element={<ProtectedRoute requiredRole="teacher"><TeacherDashboardPage /></ProtectedRoute>} />
          <Route path="/teacher/sets" element={<ProtectedRoute requiredRole="teacher"><TeacherSetsPage /></ProtectedRoute>} />
          <Route path="/teacher/marking" element={<ProtectedRoute requiredRole="teacher"><TeacherMarkingRoute /></ProtectedRoute>} />
          <Route path="/teacher/marking/panel/:classId" element={<ProtectedRoute requiredRole="teacher"><TeacherMarkingPanel /></ProtectedRoute>} />
          <Route path="/teacher/marking/:studentId" element={<ProtectedRoute requiredRole="teacher"><TeacherMarkingPage /></ProtectedRoute>} />
          <Route path="/teacher/deploy" element={<ProtectedRoute requiredRole="teacher"><TeacherResourceDeployPage /></ProtectedRoute>} />
          <Route path="/teacher/assign" element={<ProtectedRoute requiredRole="teacher"><TeacherAssignPage /></ProtectedRoute>} />
          <Route path="/teacher/profiles" element={<ProtectedRoute requiredRole="teacher"><TeacherStudentProfilesPage /></ProtectedRoute>} />
          <Route path="/teacher/inquiries" element={<ProtectedRoute requiredRole="teacher"><TeacherParentInquiriesPage /></ProtectedRoute>} />
          <Route path="/teacher/live-monitoring" element={<ProtectedRoute requiredRole="teacher"><LiveMonitoringPage /></ProtectedRoute>} />
          <Route path="/teacher/insights" element={<ProtectedRoute requiredRole="teacher"><TeacherInsightsPage /></ProtectedRoute>} />
          <Route path="/teacher/analytics" element={<ProtectedRoute requiredRole="teacher"><TeacherAnalyticsPage /></ProtectedRoute>} />
          <Route path="/teacher/system" element={<ProtectedRoute requiredRole="teacher"><TeacherSystemToolsPage /></ProtectedRoute>} />

          {/* Add Admin Routes */}
          <Route path="/admin/knowledge-base" element={
            <ProtectedRoute requiredRole="admin">
              <KnowledgeBasePage />
            </ProtectedRoute>
          } />
        </Routes>

        <AthroSystem />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
