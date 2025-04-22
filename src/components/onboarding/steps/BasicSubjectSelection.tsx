
import React, { useEffect, useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';
import { useToast } from '@/hooks/use-toast';

export const BasicSubjectSelection: React.FC = () => {
  const { selectedSubjects, selectSubject, removeSubject } = useOnboarding();
  const { subjects, isLoading, usingDefaultSubjects } = useSubjects();
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);

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

  // Default subjects if none are loaded
  const defaultSubjects = [
    'Mathematics', 'English', 'Science', 
    'History', 'Geography', 'Computer Science',
    'Art', 'Music', 'Physical Education'
  ];
  
  // Use subjects from the hook if available, otherwise use defaults
  const displaySubjects = subjects.length > 0 ? subjects : defaultSubjects;

  useEffect(() => {
    if (usingDefaultSubjects && !initialized && !isLoading) {
      toast({
        title: "Default subjects loaded",
        description: "We're showing default subjects as we couldn't find your selections",
      });
      setInitialized(true);
    }
  }, [usingDefaultSubjects, isLoading, initialized, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading subjects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {usingDefaultSubjects && (
        <p className="text-sm text-amber-500 mb-4">
          Using default subjects. Select the ones you're studying.
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {displaySubjects.map((subject) => {
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
