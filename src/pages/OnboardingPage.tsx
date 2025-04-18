
import React from 'react';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { SubjectsSelector } from '@/components/onboarding/SubjectsSelector';
import { SlotSelection } from '@/components/onboarding/SlotSelection';
import { StudyPlanGenerator } from '@/components/onboarding/StudyPlanGenerator';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/contexts/OnboardingContext';

const OnboardingContent: React.FC = () => {
  const { currentStep, updateOnboardingStep } = useOnboarding();
  
  // Modified step sequence to skip diagnostic quiz
  const steps = [
    { id: 'subjects', component: SubjectsSelector, title: 'Select Subjects' },
    { id: 'availability', component: SlotSelection, title: 'Set Study Times' },
    { id: 'generatePlan', component: StudyPlanGenerator, title: 'Generate Study Plan' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const CurrentComponent = steps[currentStepIndex]?.component || steps[0].component;

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
