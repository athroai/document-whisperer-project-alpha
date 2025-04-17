
import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Check, Plus } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';

export const SubjectsSelector: React.FC = () => {
  const { selectedSubjects, selectSubject, removeSubject, updateOnboardingStep } = useOnboarding();
  const { subjects, isLoading } = useSubjects();

  const isSubjectSelected = (subject: string) => {
    return selectedSubjects.some(s => s.subject === subject);
  };

  const handleSubjectToggle = (subject: string) => {
    if (isSubjectSelected(subject)) {
      removeSubject(subject);
    } else {
      // Default confidence of 5 when selecting a new subject
      selectSubject(subject, 5);
    }
  };

  const handleConfidenceChange = (subject: string, confidence: number) => {
    selectSubject(subject, confidence);
  };

  const handleContinue = () => {
    if (selectedSubjects.length > 0) {
      updateOnboardingStep('availability');
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading subjects...</div>;
  }

  return (
    <div className="space-y-4">
      <p className="mb-4">Select the subjects you want to study and rate your confidence level:</p>
      
      <div className="space-y-3">
        {subjects.map((subject) => {
          const isSelected = isSubjectSelected(subject);
          const currentConfidence = selectedSubjects.find(s => s.subject === subject)?.confidence ?? 5;
          
          return (
            <div key={subject} className="border rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">{subject}</span>
                <Button 
                  size="sm" 
                  variant={isSelected ? "default" : "outline"}
                  className={isSelected ? "bg-purple-600 hover:bg-purple-700" : ""}
                  onClick={() => handleSubjectToggle(subject)}
                >
                  {isSelected ? (
                    <><Check className="h-4 w-4 mr-1" /> Selected</>
                  ) : (
                    <><Plus className="h-4 w-4 mr-1" /> Select</>
                  )}
                </Button>
              </div>
              
              {isSelected && (
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-500 w-24">Confidence:</span>
                  <Slider
                    value={[currentConfidence]}
                    max={10}
                    step={1}
                    onValueChange={(value) => handleConfidenceChange(subject, value[0])}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-center">{currentConfidence}/10</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedSubjects.length > 0 && (
        <div className="pt-4 border-t mt-6 flex justify-between items-center">
          <p className="text-sm font-medium text-green-600">
            {selectedSubjects.length} {selectedSubjects.length === 1 ? 'subject' : 'subjects'} selected
          </p>
          <Button 
            onClick={handleContinue}
            disabled={selectedSubjects.length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};
