
import React from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import TeacherSidebar from './TeacherSidebar';

interface TeacherDashboardLayoutProps {
  children: React.ReactNode;
}

const TeacherDashboardLayout: React.FC<TeacherDashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const activePage = location.pathname.split('/').pop() || 'dashboard';

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <div className="flex flex-1">
        <TeacherSidebar activePage={activePage} />
        <div className="flex-1 p-6 bg-gray-50">
          {children}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboardLayout;
