
import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';

export const BasicSubjectSelection: React.FC = () => {
  const { selectedSubjects, selectSubject, removeSubject } = useOnboarding();
  const { subjects, isLoading } = useSubjects();

  const isSubjectSelected = (subject: string) => {
    return selectedSubjects.some(s => s.subject === subject);
  };

  const handleSubjectToggle = (subject: string) => {
    if (isSubjectSelected(subject)) {
      removeSubject(subject);
    } else {
      selectSubject(subject, "medium");
    }
  };

  if (isLoading) {
    return <div>Loading subjects...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {subjects.map((subject) => {
          const isSelected = isSubjectSelected(subject);
          return (
            <Button
              key={subject}
              variant={isSelected ? "default" : "outline"}
              className={`justify-start ${isSelected ? "bg-primary" : ""}`}
              onClick={() => handleSubjectToggle(subject)}
            >
              {isSelected && <Check className="mr-2 h-4 w-4" />}
              {subject}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
