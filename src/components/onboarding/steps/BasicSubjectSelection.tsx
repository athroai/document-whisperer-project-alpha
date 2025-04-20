
import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSubjects } from '@/hooks/useSubjects';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

export const BasicSubjectSelection: React.FC = () => {
  const { selectedSubjects, selectSubject, removeSubject, updateOnboardingStep } = useOnboarding();
  const { subjects, isLoading } = useSubjects();

  const handleContinue = () => {
    if (selectedSubjects.length > 0) {
      updateOnboardingStep('schedule');
    }
  };

  const isSelected = (subject: string) => selectedSubjects.some(s => s.subject === subject);

  const toggleSubject = (subject: string) => {
    if (isSelected(subject)) {
      removeSubject(subject);
    } else {
      selectSubject(subject, 'Neutral');
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading subjects...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Choose Your Subjects</h2>
        <p className="text-muted-foreground mt-2">Select the subjects you want to study</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((subject) => (
          <Card 
            key={subject}
            className={`p-4 cursor-pointer transition-all ${
              isSelected(subject) ? 'border-purple-500 bg-purple-50' : ''
            }`}
            onClick={() => toggleSubject(subject)}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{subject}</span>
              {isSelected(subject) && (
                <Badge variant="secondary" className="bg-purple-100">
                  Selected
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleContinue}
          disabled={selectedSubjects.length === 0}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Continue <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
