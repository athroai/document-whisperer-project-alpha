
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TeacherMarkingPanel from './TeacherMarkingPanel';
import TeacherMarkingPage from './TeacherMarkingPage';
import ProtectedRoute from '@/components/ProtectedRoute';

const TeacherMarkingRoute: React.FC = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherMarkingPanel />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ai-review" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherMarkingPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default TeacherMarkingRoute;
