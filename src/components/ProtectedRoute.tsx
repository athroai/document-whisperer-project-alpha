
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
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
  const [redirectStuck, setRedirectStuck] = useState(false);
  
  const { isLicensed, redirectTo } = useLicenseCheck(user);
  const { hasAccess } = useRoleAccess(user, requiredRole);

  // Fail-safe for stuck redirects
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

  useEffect(() => {
    if (requireLicense && !isLicensed && user && user.role === 'teacher') {
      redirectTo('/required-license');
    }
  }, [isLicensed, requireLicense, user, redirectTo]);

  // Handle manual recovery from stuck states
  const handleManualRedirect = () => {
    if (user) {
      if (user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/athro/select');
      }
    } else {
      navigate('/login');
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
    return <Navigate to={user.role === 'teacher' ? '/teacher' : '/athro/select'} replace />;
  }
  
  // Redirect teachers to dashboard if trying to access student routes
  if (user.role === 'teacher' && window.location.pathname === '/home') {
    return <Navigate to="/teacher" replace />;
  }
  
  // Redirect students to athro selector if trying to access teacher routes
  if (user.role === 'student' && window.location.pathname.startsWith('/teacher')) {
    return <Navigate to="/athro/select" replace />;
  }
  
  // Handle function children that need user data
  if (typeof children === 'function') {
    return children({ user });
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
