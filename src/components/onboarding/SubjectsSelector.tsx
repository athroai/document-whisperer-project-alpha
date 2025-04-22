
import React, { useEffect, useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Plus } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfidenceLabel } from '@/types/confidence';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const SubjectsSelector: React.FC = () => {
  const { selectedSubjects, selectSubject, removeSubject, updateOnboardingStep } = useOnboarding();
  const { subjects, isLoading, usingDefaultSubjects, allSubjects } = useSubjects();
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);
  const { state: authState } = useAuth();

  const confidenceOptions: ConfidenceLabel[] = ['low', 'medium', 'high'];

  const isSubjectSelected = (subject: string) => {
    return selectedSubjects.some(s => s.subject === subject);
  };

  const handleSubjectToggle = async (subject: string) => {
    if (isSubjectSelected(subject)) {
      removeSubject(subject);
      // Also remove from database if user is authenticated
      if (authState.user?.id) {
        try {
          await supabase
            .from('student_subject_preferences')
            .delete()
            .eq('student_id', authState.user.id)
            .eq('subject', subject);
        } catch (err) {
          console.error('Error removing subject from database:', err);
        }
      }
    } else {
      selectSubject(subject, "medium" as ConfidenceLabel);
      // Also add to database if user is authenticated
      if (authState.user?.id) {
        try {
          await supabase
            .from('student_subject_preferences')
            .insert({
              student_id: authState.user.id,
              subject: subject,
              confidence_level: "medium"
            });
        } catch (err) {
          console.error('Error adding subject to database:', err);
        }
      }
    }
  };

  const handleConfidenceChange = async (subject: string, confidence: ConfidenceLabel) => {
    selectSubject(subject, confidence);
    
    // Update in database if user is authenticated
    if (authState.user?.id) {
      try {
        const { error } = await supabase
          .from('student_subject_preferences')
          .upsert({
            student_id: authState.user.id,
            subject: subject,
            confidence_level: confidence
          });
          
        if (error) {
          console.error('Error updating subject confidence in database:', error);
        }
      } catch (err) {
        console.error('Error updating subject confidence:', err);
      }
    }
  };

  const handleContinue = () => {
    if (selectedSubjects.length > 0) {
      updateOnboardingStep('availability');
    } else {
      toast({
        title: "Select subjects",
        description: "Please select at least one subject before continuing",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (usingDefaultSubjects && !initialized && !isLoading) {
      toast({
        title: "Subject selection",
        description: "Select the subjects you're studying for GCSE",
      });
      setInitialized(true);
    }
  }, [usingDefaultSubjects, isLoading, initialized, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-lg">Loading subjects...</span>
      </div>
    );
  }

  // Use the full list of subjects from the useSubjects hook
  const displaySubjects = allSubjects;

  return (
    <div className="space-y-4">
      <p className="mb-4">Select the subjects you want to study and rate your confidence level:</p>
      
      {usingDefaultSubjects && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4">
          <p className="text-amber-700 text-sm">
            We're showing all available subjects. Please select the ones you're studying for GCSE.
          </p>
        </div>
      )}
      
      <div className="space-y-3">
        {displaySubjects.map((subject) => {
          const isSelected = isSubjectSelected(subject);
          const subjectData = selectedSubjects.find(s => s.subject === subject);
          const currentConfidence = subjectData?.confidence || "medium";
          
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
                    value={currentConfidence}
                    onValueChange={(value) => handleConfidenceChange(subject, value as ConfidenceLabel)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select confidence level" />
                    </SelectTrigger>
                    <SelectContent>
                      {confidenceOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
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
