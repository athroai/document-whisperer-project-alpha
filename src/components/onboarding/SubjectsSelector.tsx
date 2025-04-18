
import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Check, Plus } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfidenceLabel, confidenceOptions, confidenceToNumber } from '@/types/confidence';

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
      // Default confidence of "Neutral" when selecting a new subject
      selectSubject(subject, confidenceToNumber("Neutral"));
    }
  };

  const handleConfidenceChange = (subject: string, confidence: ConfidenceLabel) => {
    selectSubject(subject, confidenceToNumber(confidence));
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
          const subjectData = selectedSubjects.find(s => s.subject === subject);
          const currentConfidence = subjectData?.confidence ?? confidenceToNumber("Neutral");
          
          // Find the confidence label that corresponds to this numeric value
          const confidenceIndex = Math.min(Math.max(Math.round(currentConfidence) - 1, 0), confidenceOptions.length - 1);
          const currentConfidenceLabel = confidenceOptions[confidenceIndex];
          
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
                  <span className="text-sm text-gray-500 min-w-24">Confidence:</span>
                  <Select
                    value={String(currentConfidenceLabel)}
                    onValueChange={(value) => handleConfidenceChange(subject, value as ConfidenceLabel)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select confidence level" />
                    </SelectTrigger>
                    <SelectContent>
                      {confidenceOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
