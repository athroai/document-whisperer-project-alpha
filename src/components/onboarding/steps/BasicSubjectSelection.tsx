
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
  const { allSubjects } = useSubjects();
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);
  const { state: authState } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const isSubjectSelected = (subject: string) => {
    return selectedSubjects.some(s => s.subject === subject);
  };

  const handleSubjectToggle = async (subject: string) => {
    setIsSaving(true);
    try {
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
            toast({
              title: "Error",
              description: "Failed to remove subject. Please try again.",
              variant: "destructive"
            });
          }
        }
      } else {
        selectSubject(subject, "medium");
        // Also add to database if user is authenticated
        if (authState.user?.id) {
          try {
            console.log(`Adding subject ${subject} to database with confidence medium`);
            const { error } = await supabase
              .from('student_subject_preferences')
              .upsert({
                student_id: authState.user.id,
                subject: subject,
                confidence_level: 5 // Use numeric value for database
              });
              
            if (error) {
              throw error;
            }
            console.log(`Successfully added subject ${subject} to database`);
          } catch (err) {
            console.error('Error adding subject to database:', err);
            toast({
              title: "Error",
              description: "Failed to save subject. Please try again.",
              variant: "destructive"
            });
          }
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  // The subjects to display - use all available subjects
  const displaySubjects = allSubjects;

  useEffect(() => {
    if (!initialized) {
      toast({
        title: "Subject selection",
        description: "Please select the GCSE subjects you're studying",
      });
      setInitialized(true);
    }
  }, [initialized, toast]);

  if (!displaySubjects || displaySubjects.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading subjects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {displaySubjects.map((subject) => {
          const isSelected = isSubjectSelected(subject);
          return (
            <Button
              key={subject}
              variant={isSelected ? "default" : "outline"}
              className={`justify-start ${isSelected ? "bg-primary" : ""}`}
              onClick={() => handleSubjectToggle(subject)}
              disabled={isSaving}
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
