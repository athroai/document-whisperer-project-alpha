
import React from 'react';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { SubjectsSelector } from '@/components/onboarding/SubjectsSelector';
import { SlotSelection } from '@/components/onboarding/SlotSelection';
import { DiagnosticQuizSelector } from '@/components/onboarding/DiagnosticQuizSelector';
import { StudyPlanGenerator } from '@/components/onboarding/StudyPlanGenerator';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/contexts/OnboardingContext';

const OnboardingContent: React.FC = () => {
  const { currentStep, updateOnboardingStep } = useOnboarding();
  
  const steps = [
    { id: 'subjects', component: SubjectsSelector, title: 'Select Subjects' },
    { id: 'availability', component: SlotSelection, title: 'Set Study Times' },
    { id: 'diagnosticQuiz', component: DiagnosticQuizSelector, title: 'Diagnostic Quiz' },
    { id: 'generatePlan', component: StudyPlanGenerator, title: 'Generate Study Plan' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const CurrentComponent = steps[currentStepIndex]?.component || steps[0].component;

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      updateOnboardingStep(steps[nextIndex].id);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      updateOnboardingStep(steps[prevIndex].id);
    }
  };

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
