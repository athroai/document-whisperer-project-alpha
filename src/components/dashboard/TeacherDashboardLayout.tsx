
import React, { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import TeacherSidebar from './TeacherSidebar';
import TeacherSetsPage from '@/pages/teacher/TeacherSetsPage';
import TeacherMarkingPage from '@/pages/teacher/TeacherMarkingPage';
import TeacherStudentProfilesPage from '@/pages/teacher/TeacherStudentProfilesPage';
import TeacherInsightsPage from '@/pages/teacher/TeacherInsightsPage';
import TeacherAnalyticsPage from '@/pages/teacher/TeacherAnalyticsPage';
import TeacherResourceDeployPage from '@/pages/teacher/TeacherResourceDeployPage';
import TeacherParentInquiriesPage from '@/pages/teacher/TeacherParentInquiriesPage';
import TeacherSystemToolsPage from '@/pages/teacher/TeacherSystemToolsPage';
import NotFound from '@/pages/NotFound';

interface TeacherDashboardLayoutProps {
  children?: ReactNode;
}

const TeacherDashboardLayout: React.FC<TeacherDashboardLayoutProps> = ({ children }) => {
  const { section } = useParams();
  const { state } = useAuth();
  const { user } = state;

  // Ensure user is a teacher
  if (!user || user.role !== 'teacher') {
    return <div className="p-8">Access Restricted: Teacher role required</div>;
  }

  // Render the correct component based on the section parameter if no children are provided
  const renderSection = () => {
    // If children are provided, render them instead of section content
    if (children) {
      return children;
    }
    
    switch (section) {
      case 'sets':
        return <TeacherSetsPage />;
      case 'marking':
        return <TeacherMarkingPage />;
      case 'profiles':
        return <TeacherStudentProfilesPage />;
      case 'insights':
        return <TeacherInsightsPage />;
      case 'analytics':
        return <TeacherAnalyticsPage />;
      case 'deploy':
        return <TeacherResourceDeployPage />;
      case 'notifications':
        return <div className="p-6">Notifications Panel</div>;
      case 'assign':
        return <div className="p-6">Assign Work Panel</div>;
      case 'inquiries':
        return <TeacherParentInquiriesPage />;
      case 'system':
        return <TeacherSystemToolsPage />;
      default:
        return <NotFound />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <div className="flex flex-1">
        <TeacherSidebar activePage={section || 'dashboard'} />
        <div className="flex-1 p-6 bg-gray-50">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboardLayout;
