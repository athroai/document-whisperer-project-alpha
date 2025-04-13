
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TeacherMarkingPanel from './TeacherMarkingPanel';
import TeacherMarkingPage from './TeacherMarkingPage';
import TeacherInsightsPage from './TeacherInsightsPage';
import TeacherResourceDeployPage from './TeacherResourceDeployPage';
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
      <Route 
        path="/insights" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherInsightsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/deploy" 
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherResourceDeployPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default TeacherMarkingRoute;
