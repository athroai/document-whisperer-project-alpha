
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode | (({ user }: { user: any }) => React.ReactNode);
  requireLicense?: boolean;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireLicense = false,
  requiredRole
}) => {
  const { state } = useAuth();
  const { user, isLoading } = state;
  const location = useLocation();
  
  // Log authentication state for debugging
  useEffect(() => {
    if (isLoading) {
      console.log('ProtectedRoute: Auth is loading');
    } else if (user) {
      console.log('ProtectedRoute: User is authenticated', user.id);
    } else {
      console.log('ProtectedRoute: No authenticated user');
    }
  }, [user, isLoading]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }
  
  if (!user) {
    console.log('Redirecting to login from:', location.pathname);
    // Pass the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Check for required role if specified
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/home" replace />;
  }
  
  // If license is required and user doesn't have a license exemption, check license
  if (requireLicense && !user.licenseExempt && !user.email.endsWith('@nexastream.co.uk')) {
    // Mock license check - in production would check against Firestore
    if (!user.schoolId) {
      return <Navigate to="/license-required" replace />;
    }
  }

  // Redirect teachers to dashboard if trying to access student routes
  if (user.role === 'teacher' && location.pathname === '/home') {
    return <Navigate to="/teacher-dashboard" replace />;
  }
  
  // Handle function children that need user data
  if (typeof children === 'function') {
    return children({ user });
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
