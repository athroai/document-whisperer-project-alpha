
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode | (({ user }: { user: any }) => React.ReactNode);
  requiredRole?: UserRole;
  requireLicense?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requireLicense = false
}) => {
  const { state } = useAuth();
  const { user, loading } = state;
  const navigate = useNavigate();
  
  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Loading...</h2>
          <p className="text-gray-600 mb-4">Setting up your experience</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if no user
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Ensure the session persists if rememberMe is true
  if (user.rememberMe) {
    localStorage.setItem('athro_user', JSON.stringify(user));
  }
  
  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    // Redirect based on user role
    if (user.role === 'teacher') {
      return <Navigate to="/teacher-dashboard" replace />;
    } else {
      return <Navigate to="/athro/select" replace />;
    }
  }
  
  // Check license status (skip for Nexastream users)
  if (requireLicense && !user.licenseExempt && user.role === 'teacher' && !user.schoolId) {
    return <Navigate to="/required-license" replace />;
  }
  
  // Handle function children that need user data
  if (typeof children === 'function') {
    return children({ user });
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
