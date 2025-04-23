
import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { SubjectsSelector } from '@/components/onboarding/SubjectsSelector';

export const SubjectSelectionStep: React.FC = () => {
  // The SubjectsSelector component handles subject selection, confidence, and progression.
  // It already uses onboarding context internally, so we don't need custom logic here.
  // We just need to show the selector and let it handle navigation onward.
  
  return (
    <div className="space-y-6">
      <SubjectsSelector />
    </div>
  );
};
