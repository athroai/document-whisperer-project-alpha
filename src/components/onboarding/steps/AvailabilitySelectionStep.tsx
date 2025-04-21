
import React from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SlotSelection } from '@/components/onboarding/SlotSelection';

export const AvailabilitySelectionStep: React.FC = () => {
  const { updateOnboardingStep } = useOnboarding();
  
  const handleBack = () => {
    updateOnboardingStep('subjects');
  };
  
  const handleContinue = () => {
    updateOnboardingStep('style');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Set Your Study Schedule</h2>
        <p className="text-gray-600 text-sm mb-4">
          Tell us when you'd like to study. We'll create a calendar with study sessions that fit your availability.
        </p>
      </div>
      
      <SlotSelection />
      
      <div className="pt-4 flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <Button onClick={handleContinue}>
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
