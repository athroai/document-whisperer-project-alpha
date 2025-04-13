
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import WelcomePage from "./pages/WelcomePage";
import Index from "./pages/Index";
import AthroPage from "./pages/AthroPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import FilesPage from "./pages/FilesPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import CalendarPage from "./pages/CalendarPage";
import QuizPage from "./pages/QuizPage";
import StudySessionPage from "./pages/StudySessionPage";
import LicenseRequiredPage from "./pages/LicenseRequiredPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AthroMathsPage from "./pages/athro/AthroMathsPage";
import AthroSelectorPage from "./pages/athro/AthroSelectorPage";
import AthroSciencePage from "./pages/athro/AthroSciencePage";
import TeacherDashboardPage from "./pages/TeacherDashboardPage";
import TeacherStudentProfilesPage from "./pages/teacher/TeacherStudentProfilesPage";
import TeacherSetsPage from "./pages/teacher/TeacherSetsPage";
import TeacherInsightsPage from "./pages/teacher/TeacherInsightsPage";
import TeacherAssignPage from "./pages/teacher/TeacherAssignPage";
import TeacherMarkingPanel from "./pages/teacher/TeacherMarkingPanel"; 
import TeacherResourceDeployPage from "./pages/teacher/TeacherResourceDeployPage"; 
import TeacherParentInquiriesPage from "./pages/teacher/TeacherParentInquiriesPage";
import TeacherSystemToolsPage from "./pages/teacher/TeacherSystemToolsPage";
import LiveMonitoringPage from "./pages/teacher/LiveMonitoringPage";
import StudentAssignmentsPage from "./pages/student/StudentAssignmentsPage";
import StudentFeedbackPage from "./pages/student/StudentFeedbackPage";
import StudentAssignmentViewPage from "./pages/student/StudentAssignmentViewPage";
import StudentResourcesPage from "./pages/student/StudentResourcesPage";
import { UserRole } from "./types/auth";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/required-license" element={<LicenseRequiredPage />} />

      {/* Protected Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments"
        element={
          <ProtectedRoute>
            <AssignmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/files"
        element={
          <ProtectedRoute>
            <FilesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarPage />
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
        path="/quiz"
        element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:id"
        element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/study"
        element={
          <ProtectedRoute>
            <StudySessionPage />
          </ProtectedRoute>
        }
      />

      {/* Athro Chat Routes - Ensure these are properly nested and accessible */}
      <Route path="/athro/*" element={<AthroPage />} />
      <Route path="/athro/select" element={<AthroSelectorPage />} />
      <Route path="/athro/maths" element={<AthroMathsPage />} />
      <Route path="/athro/science" element={<AthroSciencePage />} />

      {/* Teacher Dashboard Routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/profiles"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherStudentProfilesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/sets"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherSetsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/insights"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherInsightsPage />
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
      <Route
        path="/teacher/deploy"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherResourceDeployPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/marking"
        element={
          <ProtectedRoute requiredRole="teacher" requireLicense={true}>
            <TeacherMarkingPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/inquiries"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherParentInquiriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/system"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherSystemToolsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/live-monitoring"
        element={
          <ProtectedRoute requiredRole="teacher">
            <LiveMonitoringPage />
          </ProtectedRoute>
        }
      />

      {/* Student Assignment Routes */}
      <Route
        path="/student/assignments"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentAssignmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/assignments/:assignmentId"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentAssignmentViewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/feedback"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentFeedbackPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/my-resources"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentResourcesPage />
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
