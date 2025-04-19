
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface RequireAuthProps {
  children: JSX.Element;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { state } = useAuth();
  const location = useLocation();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (state.user?.id) {
        try {
          const { data } = await supabase
            .from('onboarding_progress')
            .select('*')
            .eq('student_id', state.user.id)
            .maybeSingle();

          setOnboardingCompleted(data?.current_step === 'completed');
        } catch (error) {
          console.error('Error checking onboarding status:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, [state.user?.id]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (onboardingCompleted === false && 
      location.pathname !== '/onboarding' && 
      location.pathname !== '/chat-onboarding') {
    return <Navigate to="/chat-onboarding" />;
  }

  return children;
};

export default RequireAuth;
