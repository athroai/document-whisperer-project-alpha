
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ArrowRight } from 'lucide-react';
import { SubjectSelector } from '../core/SubjectSelector';
import { useToast } from '@/hooks/use-toast';
import { ConfidenceLabel } from '@/types/confidence';

export const SubjectSelectionStep: React.FC = () => {
  const { selectedSubjects, updateOnboardingStep, setSelectedSubjects } = useOnboarding();
  const { toast } = useToast();

  // Handler to set subjects in the onboarding context
  const handleUpdateSubjects = (subjects: { subject: string; confidence: ConfidenceLabel }[]) => {
    setSelectedSubjects(subjects);
  };

  const handleContinue = () => {
    if (selectedSubjects.length > 0) {
      updateOnboardingStep('availability');
    } else {
      toast({
        title: "Subject selection required",
        description: "No subjects selected. Please choose your subjects before continuing.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Select Your GCSE Subjects</h2>
        <p className="text-gray-600 text-sm mb-4">
          Choose the subjects you're studying. Don't worry, you can change these later.
        </p>
      </div>

      <SubjectSelector
        subjects={selectedSubjects}
        updateSubjects={handleUpdateSubjects}
      />

      <div className="pt-4 flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={selectedSubjects.length === 0}
        >
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
