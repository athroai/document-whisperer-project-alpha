
import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const SUBJECTS = [
  'Mathematics', 'Science', 'English', 'History', 
  'Geography', 'Welsh', 'Languages', 'Religious Education'
];

export const SubjectsSelector: React.FC = () => {
  const { selectedSubjects, selectSubject } = useOnboarding();

  return (
    <div className="space-y-4">
      <p>Select the subjects you want to study and your confidence level:</p>
      {SUBJECTS.map((subject) => {
        const currentConfidence = selectedSubjects.find(s => s.subject === subject)?.confidence ?? 5;
        
        return (
          <div key={subject} className="flex items-center space-x-4">
            <span className="w-32">{subject}</span>
            <Slider
              defaultValue={[currentConfidence]}
              max={10}
              step={1}
              onValueChange={(value) => selectSubject(subject, value[0])}
            />
            <span>{currentConfidence}/10</span>
          </div>
        );
      })}
    </div>
  );
};
