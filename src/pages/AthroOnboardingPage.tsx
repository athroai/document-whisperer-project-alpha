
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { SubjectSelectionStep } from '@/components/onboarding/steps/SubjectSelectionStep';
import { LearningStyleStep } from '@/components/onboarding/steps/LearningStyleStep';
import { StudyScheduleStep } from '@/components/onboarding/steps/StudyScheduleStep';
import { StudyPlanStep } from '@/components/onboarding/steps/StudyPlanStep';
import { AthroAi } from '@/components/onboarding/AthroAi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

const steps = [
  { id: 'subjects', title: 'Select Your Subjects', component: SubjectSelectionStep },
  { id: 'learning-style', title: 'Your Learning Style', component: LearningStyleStep },
  { id: 'schedule', title: 'Study Schedule', component: StudyScheduleStep },
  { id: 'plan', title: 'Your Study Plan', component: StudyPlanStep },
  { id: 'chat', title: 'Meet Your Study Assistant', component: AthroAi }
];

const OnboardingContent: React.FC = () => {
  const { state } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  if (state.loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!state.user) {
    return <Navigate to="/login" />;
  }

  const CurrentStepComponent = steps[currentStepIndex].component;
  
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="container mx-auto p-4 pt-8 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex-1 relative ${
                  index < steps.length - 1 ? 'after:content-[""] after:h-[2px] after:w-full after:bg-gray-200 after:absolute after:top-1/2 after:left-1/2 after:-z-10' : ''
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${index <= currentStepIndex ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}
                  `}>
                    {index + 1}
                  </div>
                  <span className="text-sm mt-2">{step.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-6 mb-6">
          <CurrentStepComponent />
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            className="flex items-center gap-2"
          >
            {currentStepIndex === steps.length - 2 ? 'Meet Your Assistant' : 'Next'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const AthroOnboardingPage: React.FC = () => {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
};

export default AthroOnboardingPage;
