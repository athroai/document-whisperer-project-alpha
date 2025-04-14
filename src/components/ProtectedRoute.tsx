
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import LoadingSpinner from './ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectPath?: string;
  allowLicenseExempt?: boolean;
  loadingComponent?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectPath = '/login',
  allowLicenseExempt = false,
  loadingComponent = (
    <div className="flex h-screen items-center justify-center">
      <LoadingSpinner className="h-12 w-12" />
    </div>
  ),
}) => {
  const { state } = useAuth();
  const { user, loading } = state;
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return <>{loadingComponent}</>;
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Check role requirements if specified
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Allow license exempt users to bypass role check if enabled
    if (allowLicenseExempt && user.licenseExempt) {
      return <>{children}</>;
    }
    
    // Check if user has one of the required roles
    if (!roles.includes(user.role)) {
      // For students, redirect to license required page
      if (user.role === 'student') {
        return <Navigate to="/license-required" state={{ from: location }} replace />;
      }
      // For others, just redirect to login
      return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }
  }

  // User is authenticated and meets role requirements
  return <>{children}</>;
};

export default ProtectedRoute;
