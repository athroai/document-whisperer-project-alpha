
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck';
import { useToast } from '@/hooks/use-toast';
import CalendarPageLoading from './CalendarPageLoading';

interface CalendarAuthCheckProps {
  children: React.ReactNode;
  fromSetup?: boolean;
}

const CalendarAuthCheck: React.FC<CalendarAuthCheckProps> = ({ children, fromSetup = false }) => {
  const { state: authState } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { needsOnboarding, isLoading: checkingOnboarding } = useOnboardingCheck(false);

  React.useEffect(() => {
    if (!authState.isLoading && !authState.user) {
      console.log('No authenticated user, redirecting to login');
      navigate('/login');
    }
  }, [authState.isLoading, authState.user, navigate]);

  React.useEffect(() => {
    if (!checkingOnboarding && needsOnboarding === true && authState.user && !fromSetup) {
      toast({
        title: "Onboarding Required",
        description: "Please complete onboarding to set up your study plan."
      });
      navigate('/onboarding');
    }
  }, [needsOnboarding, checkingOnboarding, navigate, authState.user, toast, fromSetup]);

  if (authState.isLoading || checkingOnboarding) {
    return <CalendarPageLoading />;
  }

  if (!authState.user) return null;

  return <>{children}</>;
};

export default CalendarAuthCheck;
