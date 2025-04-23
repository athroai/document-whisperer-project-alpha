
import React from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ArrowRight } from 'lucide-react';
import { SubjectSelector } from '../core/SubjectSelector';

export const SubjectSelectionStep: React.FC = () => {
  const { selectedSubjects, updateOnboardingStep, setSelectedSubjects } = useOnboarding();

  // Handler to set subjects in the onboarding context
  const handleUpdateSubjects = (subjects: { subject: string; confidence: 'low' | 'medium' | 'high' }[]) => {
    setSelectedSubjects(subjects);
  };

  const handleContinue = () => {
    if (selectedSubjects.length > 0) {
      updateOnboardingStep('availability');
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
