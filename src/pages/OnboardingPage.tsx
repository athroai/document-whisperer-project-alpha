
import React, { useEffect, useState } from 'react';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { verifyAuth, supabase } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Import our new onboarding steps
import { WelcomeStep } from '@/components/onboarding/steps/WelcomeStep';
import { SubjectSelectionStep } from '@/components/onboarding/steps/SubjectSelectionStep';
import { StudyScheduleStep } from '@/components/onboarding/steps/StudyScheduleStep';
import { LearningStyleStep } from '@/components/onboarding/steps/LearningStyleStep';
import { StudyPlanStep } from '@/components/onboarding/steps/StudyPlanStep';

const OnboardingContent: React.FC = () => {
  const { currentStep, updateOnboardingStep } = useOnboarding();
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

  // New steps structure
  const steps = [
    { id: 'welcome', component: WelcomeStep, title: 'Welcome to AthroAI' },
    { id: 'subjects', component: SubjectSelectionStep, title: 'Your Subjects' },
    { id: 'schedule', component: StudyScheduleStep, title: 'Study Schedule' },
    { id: 'style', component: LearningStyleStep, title: 'Learning Style' },
    { id: 'plan', component: StudyPlanStep, title: 'Your Study Plan' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep) !== -1 
    ? steps.findIndex(s => s.id === currentStep) 
    : 0;
    
  const CurrentComponent = steps[currentStepIndex]?.component;
  
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
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`text-xs font-medium ${index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {step.title}
            </div>
          ))}
        </div>
        <Progress 
          value={((currentStepIndex + 1) / steps.length) * 100} 
          className="h-2" 
        />
      </div>
      
      {/* Current Step */}
      <div className="bg-card border rounded-lg shadow-sm p-6">
        <CurrentComponent />
      </div>
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
