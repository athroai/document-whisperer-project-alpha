
import React, { useEffect, useState } from 'react';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { SubjectsSelector } from '@/components/onboarding/SubjectsSelector';
import { SlotSelection } from '@/components/onboarding/SlotSelection';
import { StudyPlanGenerator } from '@/components/onboarding/StudyPlanGenerator';
import { DiagnosticQuizSelector } from '@/components/onboarding/DiagnosticQuizSelector';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { verifyAuth, supabase } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const OnboardingContent: React.FC = () => {
  const { currentStep } = useOnboarding();
  const { state } = useAuth();
  const [authVerified, setAuthVerified] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const navigate = useNavigate();
  
  // Check Supabase authentication
  useEffect(() => {
    const checkAuth = async () => {
      setIsVerifying(true);
      
      if (!state.user) {
        setAuthVerified(false);
        setIsVerifying(false);
        return;
      }
      
      try {
        const auth = await verifyAuth();
        setAuthVerified(Boolean(auth));
        
        if (!auth) {
          toast.error("Authentication failed. Please try signing in again.");
        }
      } catch (error) {
        console.error("Auth verification error:", error);
        setAuthVerified(false);
        toast.error("Authentication error. Please refresh the page.");
      } finally {
        setIsVerifying(false);
      }
    };
    
    checkAuth();
  }, [state.user]);
  
  // Full sequence of steps including the diagnostic quiz
  const steps = [
    { id: 'subjects', component: SubjectsSelector, title: 'Select Subjects' },
    { id: 'availability', component: SlotSelection, title: 'Set Study Times' },
    { id: 'diagnosticQuiz', component: DiagnosticQuizSelector, title: 'Diagnostic Quizzes' },
    { id: 'generatePlan', component: StudyPlanGenerator, title: 'Generate Study Plan' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const CurrentComponent = steps[currentStepIndex]?.component || steps[0].component;
  
  // Handle retry authentication
  const handleRetryAuth = async () => {
    if (state.user) {
      // Try to sync the user with Supabase
      try {
        const userData = {
          id: state.user.id,
          email: state.user.email,
          role: state.user.role,
          name: state.user.displayName || state.user.email.split('@')[0]
        };
        
        const { error } = await supabase
          .from('profiles')
          .upsert(userData, { onConflict: 'id' });
          
        if (error) {
          console.error("Failed to sync user data:", error);
          toast.error("Failed to sync user data with Supabase.");
          return;
        }
        
        const auth = await verifyAuth();
        setAuthVerified(Boolean(auth));
        
        if (auth) {
          toast.success("Authentication verified successfully!");
        } else {
          toast.error("Authentication still failed. Please try logging in again.");
        }
      } catch (error) {
        console.error("Retry auth error:", error);
        toast.error("Authentication retry failed.");
      }
    } else {
      navigate('/login');
    }
  };

  if (isVerifying) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <p className="mb-4">Verifying authentication...</p>
          <Progress value={100} className="w-full animate-pulse" />
        </div>
      </div>
    );
  }

  if (authVerified === false && state.user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            Authentication error: Supabase authentication failed. Please refresh the page or sign in again.
          </AlertDescription>
        </Alert>
        <div className="flex gap-4">
          <Button onClick={handleRetryAuth}>Retry Authentication</Button>
          <Button variant="outline" onClick={() => navigate('/login')}>Return to Login</Button>
        </div>
      </div>
    );
  }
  
  if (!state.user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            You need to be logged in to access the onboarding process.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Progress 
        value={((currentStepIndex + 1) / steps.length) * 100} 
        className="mb-6" 
      />
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{steps[currentStepIndex]?.title || 'Onboarding'}</h1>
        <div className="text-sm text-gray-500">
          Step {currentStepIndex + 1} of {steps.length}
        </div>
      </div>
      
      <CurrentComponent />
    </div>
  );
};

const OnboardingPage: React.FC = () => {
  return (
    <OnboardingProvider>
      <div className="container mx-auto p-6">
        <OnboardingContent />
      </div>
    </OnboardingProvider>
  );
};

export default OnboardingPage;
