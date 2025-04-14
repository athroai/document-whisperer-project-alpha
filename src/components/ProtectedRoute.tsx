
import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import LoadingSpinner from './ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode | (({ user }: { user: any }) => React.ReactNode);
  requiredRole?: UserRole;
  requireLicense?: boolean;
  redirectPath?: string;
  loadingComponent?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requireLicense = false,
  redirectPath,
  loadingComponent
}) => {
  const { state } = useAuth();
  const { user, loading } = state;
  const navigate = useNavigate();
  
  // Show loading state while auth is being checked
  if (loading) {
    return loadingComponent || (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center animate-fade-in">
          <LoadingSpinner className="mx-auto mb-4" size={36} />
          <p className="text-gray-600 mt-2">Setting up your experience</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if no user
  if (!user) {
    return <Navigate to={redirectPath || "/login"} replace />;
  }
  
  // Ensure the session persists if rememberMe is true
  if (user.rememberMe) {
    localStorage.setItem('athro_user', JSON.stringify(user));
  }
  
  // Check role-based access
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    // Redirect based on user role
    if (user.role === 'teacher') {
      return <Navigate to="/teacher" replace />;
    } else {
      return <Navigate to="/athro/select" replace />;
    }
  }
  
  // Check license status (skip for Nexastream users)
  if (requireLicense && !user.licenseExempt && user.role === 'teacher' && !user.schoolId) {
    return <Navigate to="/license-required" replace />;
  }
  
  // Handle function children that need user data
  if (typeof children === 'function') {
    return <div className="animate-fade-in">{children({ user })}</div>;
  }
  
  return <div className="animate-fade-in">{children}</div>;
};

export default ProtectedRoute;
