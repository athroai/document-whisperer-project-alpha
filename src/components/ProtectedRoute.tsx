
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLicenseCheck } from '../hooks/useLicenseCheck';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode | (({ user }: { user: any }) => React.ReactNode);
  requireLicense?: boolean;
  requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireLicense = false,
  requiredRole
}) => {
  const { state } = useAuth();
  const { user, loading } = state;
  
  const { isLicensed, redirectTo } = useLicenseCheck(user);
  const { hasAccess } = useRoleAccess(user, requiredRole);

  useEffect(() => {
    if (requireLicense && !isLicensed && user && user.role === 'teacher') {
      redirectTo('/required-license');
    }
  }, [isLicensed, requireLicense, user]);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Check role-based access
  if (!hasAccess) {
    return <Navigate to={user.role === 'teacher' ? '/teacher' : '/home'} />;
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
