
import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Card } from '@/components/ui/card';
import { ConfidenceLabel } from '@/types/confidence';
import { Button } from '@/components/ui/button';

export const SubjectConfidenceSelector: React.FC = () => {
  const { selectedSubjects, selectSubject } = useOnboarding();
  
  const getConfidenceColor = (confidence: ConfidenceLabel) => {
    switch (confidence) {
      case 'low':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'high':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getConfidenceEmoji = (confidence: ConfidenceLabel) => {
    switch (confidence) {
      case 'low':
        return '😕';
      case 'medium':
        return '😐';
      case 'high':
        return '😀';
      default:
        return '';
    }
  };
  
  const getConfidenceText = (confidence: ConfidenceLabel) => {
    switch (confidence) {
      case 'low':
        return 'Need Help';
      case 'medium':
        return 'Okay';
      case 'high':
        return 'Confident';
      default:
        return '';
    }
  };
  
  const handleConfidenceChange = (subject: string, confidence: ConfidenceLabel) => {
    const subjectData = selectedSubjects.find(s => s.subject === subject);
    if (subjectData) {
      selectSubject(subject, confidence);
    }
  };

  return (
    <div className="space-y-3 max-h-[300px] overflow-auto pr-2">
      {selectedSubjects.map(({ subject, confidence }) => (
        <Card key={subject} className="p-3">
          <div className="flex flex-wrap items-center justify-between">
            <div className="font-medium">{subject}</div>
            <div className="flex space-x-2 mt-2 sm:mt-0">
              {(['low', 'medium', 'high'] as ConfidenceLabel[]).map((level) => (
                <Button
                  key={level}
                  size="sm"
                  variant={confidence === level ? "default" : "outline"}
                  className={confidence === level ? getConfidenceColor(level) : ""}
                  onClick={() => handleConfidenceChange(subject, level)}
                >
                  {getConfidenceEmoji(level)} {getConfidenceText(level)}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
