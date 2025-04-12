
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode | (({ user }: { user: any }) => React.ReactNode);
  requireLicense?: boolean;
  requiredRole?: 'student' | 'teacher' | 'parent';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireLicense = false,
  requiredRole
}) => {
  const { state } = useAuth();
  const { user, loading } = state;
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // If specific role is required, check user role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'teacher' ? '/teacher' : '/home'} />;
  }
  
  // Check license for teacher routes that require license
  if (requiredRole === 'teacher' && requireLicense) {
    // Check if teacher has valid license or is exempt
    if (!user.licenseExempt && !user.schoolId) {
      return <Navigate to="/required-license" />;
    }
  }
  
  // If license is required and user doesn't have a license exemption, check license
  if (requireLicense && !user.licenseExempt && !user.email.endsWith('@nexastream.co.uk')) {
    // Mock license check - in production would check against Firestore
    if (!user.schoolId) {
      return <Navigate to="/required-license" />;
    }
  }

  // Redirect teachers to dashboard if trying to access student routes
  if (user.role === 'teacher' && window.location.pathname === '/home') {
    return <Navigate to="/teacher" />;
  }
  
  // Handle function children that need user data
  if (typeof children === 'function') {
    return children({ user });
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
