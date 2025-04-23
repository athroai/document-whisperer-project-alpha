
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireOnboarding = true 
}) => {
  const { state } = useAuth();
  const location = useLocation();
  const { needsOnboarding, isLoading: onboardingCheckLoading } = useOnboardingCheck(false);

  // If auth is loading, show loading spinner
  if (state.isLoading || onboardingCheckLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!state.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user needs onboarding and it's required, redirect to onboarding
  if (requireOnboarding && needsOnboarding && !location.pathname.includes('/onboarding')) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // User is authenticated and has completed onboarding if required
  return <>{children}</>;
};

export default ProtectedRoute;
