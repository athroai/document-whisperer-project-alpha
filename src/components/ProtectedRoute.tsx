
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLicenseCheck } from '../hooks/useLicenseCheck';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { UserRole } from '../types/auth';
import { Button } from './ui/button';

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
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectStuck, setRedirectStuck] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  const { isLicensed } = useLicenseCheck(user);
  const { hasAccess } = useRoleAccess(user, requiredRole);

  // Fail-safe for stuck loading states
  useEffect(() => {
    if (loading) {
      // Set a timeout to detect stuck loading states
      const timer = setTimeout(() => {
        console.warn("Auth loading state appears to be stuck");
        setRedirectStuck(true);
      }, 3000); // 3 seconds timeout
      
      return () => clearTimeout(timer);
    } else {
      setRedirectStuck(false);
    }
  }, [loading]);

  // Handle license redirects - only once
  useEffect(() => {
    if (!loading && !redirectAttempted && requireLicense && !isLicensed && user && user.role === 'teacher') {
      setRedirectAttempted(true);
      navigate('/required-license', { replace: true });
    }
  }, [isLicensed, requireLicense, user, loading, navigate, redirectAttempted]);

  // Handle manual recovery from stuck states
  const handleManualRedirect = () => {
    if (user) {
      if (user.role === 'teacher') {
        navigate('/teacher-dashboard', { replace: true });
      } else {
        navigate('/athro/select', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Loading...</h2>
          <p className="text-gray-600 mb-4">Setting up your experience</p>
          
          {redirectStuck && (
            <div className="mt-6">
              <p className="text-amber-600 mb-3">Loading seems to be taking longer than expected</p>
              <Button onClick={handleManualRedirect} variant="default">
                Take me to my Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Check role-based access
  if (!hasAccess) {
    console.log(`Access denied: Required role: ${requiredRole}, User role: ${user.role}`);
    // Avoid repeat redirects by checking current path
    const redirectPath = user.role === 'teacher' ? '/teacher-dashboard' : '/athro/select';
    if (location.pathname !== redirectPath) {
      return <Navigate to={redirectPath} replace />;
    }
  }
  
  // Redirect teachers to dashboard if trying to access student routes
  if (user.role === 'teacher' && location.pathname === '/home') {
    return <Navigate to="/teacher-dashboard" replace />;
  }
  
  // Redirect students to athro selector if trying to access teacher routes
  if (user.role === 'student' && location.pathname.startsWith('/teacher') && location.pathname !== '/athro/select') {
    return <Navigate to="/athro/select" replace />;
  }
  
  // Handle function children that need user data
  if (typeof children === 'function') {
    return children({ user });
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;

