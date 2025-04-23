import React, { useEffect, useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Card, CardContent } from '@/components/ui/card';
import { TimeKeeperSubjectSelection } from './timekeeper/SubjectSelectionStep';
import { ScheduleSetupStep } from './timekeeper/ScheduleSetupStep';
import { StudyPlanPreviewStep } from './timekeeper/StudyPlanPreviewStep';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

type TimekeeperStep = 'subjects' | 'availability' | 'createEvents' | 'calendar';

export const TimekeeperZone: React.FC = () => {
  const { currentStep, updateOnboardingStep } = useOnboarding();
  const [isLoading, setIsLoading] = useState(true);
  const [activeStep, setActiveStep] = useState<TimekeeperStep>('subjects');
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize from onboarding context or URL
    const initStep = () => {
      setIsLoading(true);
      
      // Get step from URL if present
      const urlParams = new URLSearchParams(window.location.search);
      const stepFromUrl = urlParams.get('step') as TimekeeperStep | null;
      
      if (stepFromUrl && ['subjects', 'availability', 'createEvents', 'calendar'].includes(stepFromUrl)) {
        setActiveStep(stepFromUrl);
        if (currentStep !== stepFromUrl) {
          updateOnboardingStep(stepFromUrl);
        }
      } else if (currentStep) {
        setActiveStep(currentStep as TimekeeperStep);
        // Update URL to match current step
        navigate(`/onboarding?step=${currentStep}`, { replace: true });
      } else {
        // Default
        setActiveStep('subjects');
        updateOnboardingStep('subjects');
      }
      
      setIsLoading(false);
    };
    
    initStep();
  }, [currentStep, navigate, updateOnboardingStep]);

  useEffect(() => {
    // Handle step changes from context
    if (currentStep && currentStep !== activeStep) {
      setActiveStep(currentStep as TimekeeperStep);
      navigate(`/onboarding?step=${currentStep}`, { replace: true });
    }
  }, [currentStep, activeStep, navigate]);

  const renderActiveStep = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <div className="space-y-4 py-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      );
    }

    switch (activeStep) {
      case 'subjects':
        return <TimeKeeperSubjectSelection />;
      case 'availability':
        return <ScheduleSetupStep />;
      case 'createEvents':
        return <StudyPlanPreviewStep />;
      case 'calendar':
        // Redirect to calendar page
        navigate('/calendar');
        return null;
      default:
        return <TimeKeeperSubjectSelection />;
    }
  };

  // Render progress dots for the Timekeeper Zone
  const renderProgressDots = () => {
    const steps: { key: TimekeeperStep; label: string }[] = [
      { key: 'subjects', label: 'Subjects' },
      { key: 'availability', label: 'Schedule' },
      { key: 'createEvents', label: 'Study Plan' },
      { key: 'calendar', label: 'Calendar' },
    ];

    return (
      <div className="flex justify-center items-center mb-8">
        {steps.map((step, index) => {
          const isActive = step.key === activeStep;
          const isPast = 
            step.key === 'subjects' && ['availability', 'createEvents', 'calendar'].includes(activeStep) ||
            step.key === 'availability' && ['createEvents', 'calendar'].includes(activeStep) ||
            step.key === 'createEvents' && activeStep === 'calendar';
          
          return (
            <React.Fragment key={step.key}>
              {index > 0 && (
                <div 
                  className={`h-1 w-12 sm:w-16 mx-1 ${
                    isPast ? 'bg-purple-500' : 'bg-gray-200'
                  }`}
                />
              )}
              <div className="flex flex-col items-center">
                <div 
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-purple-600' : 
                    isPast ? 'bg-purple-500' : 'bg-gray-200'
                  }`}
                >
                  {isPast && !isActive && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span 
                  className={`text-xs mt-1 ${
                    isActive ? 'font-medium text-purple-700' : 
                    isPast ? 'text-purple-600' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">Timekeeper Zone</h1>
      <p className="text-center text-muted-foreground mb-6">
        Let's map your study schedule for success
      </p>
      
      {renderProgressDots()}
      
      <Card>
        <CardContent className="pt-6">
          {renderActiveStep()}
        </CardContent>
      </Card>
    </div>
  );
};
