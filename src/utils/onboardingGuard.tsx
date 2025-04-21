import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const withOnboardingGuard = (Component: React.ComponentType) => {
  return (props: any) => {
    const { state } = useAuth();
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);
    
    useEffect(() => {
      const checkOnboardingStatus = async () => {
        if (!state.user || state.isLoading) {
          // Still loading auth state
          return;
        }

        try {
          // Prefer DB status for new users or session just created
          const sessionAge = localStorage.getItem('auth_session_created');
          const isNewLogin = sessionAge && (Date.now() - parseInt(sessionAge)) < 10000; // 10 seconds

          if (!isNewLogin && localStorage.getItem('onboarding_completed') === 'true') {
            setIsChecking(false);
            return;
          }

          if (isNewLogin) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          const { data, error } = await supabase
            .from('onboarding_progress')
            .select('completed_at')
            .eq('student_id', state.user.id)
            .maybeSingle();

          if (error) {
            navigate('/onboarding');
            return;
          }

          if (!data?.completed_at) {
            // Force user to onboarding on new account always
            toast({
              title: "Welcome to Athro",
              description: "Let's complete your onboarding first"
            });
            navigate('/onboarding');
            return;
          } else {
            localStorage.setItem('onboarding_completed', 'true');
          }

          setIsChecking(false);
        } catch (err) {
          setIsChecking(false);
        }
      };

      checkOnboardingStatus();
    }, [state.user, state.isLoading, navigate]);
    
    if (isChecking) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          <span className="ml-2">Checking onboarding status...</span>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};
