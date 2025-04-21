
import React from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import { StudyPlanGenerator } from '@/components/onboarding/StudyPlanGenerator';

export const CalendarPreviewStep: React.FC = () => {
  const { updateOnboardingStep } = useOnboarding();
  
  const handleBack = () => {
    updateOnboardingStep('style');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Your Study Calendar</h2>
        <p className="text-gray-600 text-sm mb-4">
          Based on your preferences, we've created a personalized study calendar for you.
        </p>
      </div>
      
      <StudyPlanGenerator />
      
      <div className="pt-4">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Learning Style
        </Button>
      </div>
    </div>
  );
};
