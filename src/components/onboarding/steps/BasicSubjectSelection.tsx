
import React, { useEffect, useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const BasicSubjectSelection: React.FC = () => {
  const { selectedSubjects, selectSubject, removeSubject } = useOnboarding();
  const { subjects, isLoading, usingDefaultSubjects, allSubjects } = useSubjects();
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);
  const { state: authState } = useAuth();

  const isSubjectSelected = (subject: string) => {
    return selectedSubjects.some(s => s.subject === subject);
  };

  const handleSubjectToggle = async (subject: string) => {
    if (isSubjectSelected(subject)) {
      removeSubject(subject);
      // Also remove from database if user is authenticated
      if (authState.user?.id) {
        try {
          console.log(`Removing subject ${subject} from database`);
          await supabase
            .from('student_subject_preferences')
            .delete()
            .eq('student_id', authState.user.id)
            .eq('subject', subject);
          console.log(`Successfully removed subject ${subject} from database`);
        } catch (err) {
          console.error('Error removing subject from database:', err);
        }
      }
    } else {
      selectSubject(subject, "medium");
      // Also add to database if user is authenticated
      if (authState.user?.id) {
        try {
          console.log(`Adding subject ${subject} to database`);
          await supabase
            .from('student_subject_preferences')
            .upsert({
              student_id: authState.user.id,
              subject: subject,
              confidence_level: "medium"
            });
          console.log(`Successfully added subject ${subject} to database`);
        } catch (err) {
          console.error('Error adding subject to database:', err);
        }
      }
    }
  };

  // The subjects to display - use a combination of all available subjects
  const displaySubjects = allSubjects;

  useEffect(() => {
    if (usingDefaultSubjects && !initialized && !isLoading) {
      toast({
        title: "Subject selection",
        description: "Please select the GCSE subjects you're studying",
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
          Select the subjects you're studying for GCSE.
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
