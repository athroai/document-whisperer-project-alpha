
import React, { useState } from 'react';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { SubjectsSelector } from '@/components/onboarding/SubjectsSelector';
import { AvailabilitySelector } from '@/components/onboarding/AvailabilitySelector';
import { DiagnosticQuizSelector } from '@/components/onboarding/DiagnosticQuizSelector';
import { StudyPlanGenerator } from '@/components/onboarding/StudyPlanGenerator';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const steps = [
    { component: SubjectsSelector, title: 'Select Subjects' },
    { component: AvailabilitySelector, title: 'Set Availability' },
    { component: DiagnosticQuizSelector, title: 'Optional Diagnostic Quiz' },
    { component: StudyPlanGenerator, title: 'Generate Study Plan' }
  ];

  const CurrentComponent = steps[step].component;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  return (
    <OnboardingProvider>
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <Progress 
            value={((step + 1) / steps.length) * 100} 
            className="mb-6" 
          />
          <h1 className="text-2xl font-bold mb-4">{steps[step].title}</h1>
          <CurrentComponent />
          <div className="flex justify-between mt-6">
            {step > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
            {step < steps.length - 1 && (
              <Button onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </OnboardingProvider>
  );
};

export default OnboardingPage;
