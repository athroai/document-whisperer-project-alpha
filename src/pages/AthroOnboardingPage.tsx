
import React, { useEffect, useState } from 'react';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { verifyAuth } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AuthVerification } from '@/components/onboarding/study-plan/AuthVerification';

import { SubjectSelectionStep } from '@/components/onboarding/steps/SubjectSelectionStep';
import { AvailabilitySelectionStep } from '@/components/onboarding/steps/AvailabilitySelectionStep';
import { LearningStyleStep } from '@/components/onboarding/steps/LearningStyleStep';
import { CalendarPreviewStep } from '@/components/onboarding/steps/CalendarPreviewStep';
import { WelcomeStep } from '@/components/onboarding/steps/WelcomeStep';

const steps = [
  { id: 'welcome', component: WelcomeStep, title: 'Welcome' },
  { id: 'subjects', component: SubjectSelectionStep, title: 'Select Subjects' },
  { id: 'availability', component: AvailabilitySelectionStep, title: 'Set Schedule' },
  { id: 'learning-style', component: LearningStyleStep, title: 'Learning Style' },
  { id: 'calendar-preview', component: CalendarPreviewStep, title: 'Your Calendar' }
];

const OnboardingContent: React.FC = () => {
  const { currentStep } = useOnboarding();
  const { state } = useAuth();
  const [authVerified, setAuthVerified] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (state.isLoading) {
      return;
    }

    if (!state.user) {
      navigate('/login', { state: { from: '/athro-onboarding' } });
      return;
    }

    verifyAuth()
      .then(() => {
        setAuthVerified(true);
      })
      .catch(() => {
        setAuthVerified(false);
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, [state.isLoading, state.user, navigate]);

  const currentStepIndex = steps.findIndex(s => s.id === currentStep) !== -1 
    ? steps.findIndex(s => s.id === currentStep) 
    : 0;
    
  const CurrentComponent = steps[currentStepIndex]?.component;

  return (
    <div className="max-w-4xl mx-auto">
      <AuthVerification 
        isAuthenticated={!!state.user} 
        isLoading={state.isLoading || isVerifying}
        authVerified={authVerified} 
      />
      
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`text-sm font-medium ${index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'}`}
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
      
      <div className="bg-card border rounded-lg shadow-sm p-6">
        <CurrentComponent />
      </div>
    </div>
  );
};

const AthroOnboardingPage: React.FC = () => {
  return (
    <OnboardingProvider>
      <div className="container mx-auto p-6">
        <OnboardingContent />
      </div>
    </OnboardingProvider>
  );
};

export default AthroOnboardingPage;
