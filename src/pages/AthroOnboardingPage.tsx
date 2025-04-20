import React, { useEffect, useState } from 'react';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { verifyAuth } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

import { BasicSubjectSelection } from '@/components/onboarding/steps/BasicSubjectSelection';
import { SimpleScheduleSetup } from '@/components/onboarding/steps/SimpleScheduleSetup';
import { CreateInitialEvents } from '@/components/onboarding/steps/CreateInitialEvents';

const steps = [
  { id: 'subjects', component: BasicSubjectSelection, title: 'Select Subjects' },
  { id: 'schedule', component: SimpleScheduleSetup, title: 'Set Schedule' },
  { id: 'createEvents', component: CreateInitialEvents, title: 'Create Sessions' }
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
      navigate('/login');
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
