
import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useSubjects } from '@/hooks/useSubjects';
import { Button } from '@/components/ui/button';
import { Check, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

export const BasicSubjectSelection: React.FC = () => {
  const { selectedSubjects, selectSubject, removeSubject, updateOnboardingStep } = useOnboarding();
  const { subjects, isLoading } = useSubjects();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubjectSelected = (subject: string) => {
    return selectedSubjects.some(s => s.subject === subject);
  };

  const handleSubjectToggle = (subject: string) => {
    if (isSubjectSelected(subject)) {
      removeSubject(subject);
    } else {
      selectSubject(subject, "Neutral");
    }
  };

  const handleBack = () => {
    // If we're at the start of the flow, there's no back step
    window.history.back();
  };

  const handleContinue = async () => {
    if (selectedSubjects.length === 0) {
      toast({
        title: "No Subjects Selected",
        description: "Please select at least one subject to continue",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Move to the next step in the flow
      await updateOnboardingStep('schedule');
    } catch (error) {
      console.error("Error updating onboarding step:", error);
      toast({
        title: "Error",
        description: "Failed to save your subject selections. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading subjects...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Select Your Subjects</h2>
        <p className="text-muted-foreground mt-2">Choose the GCSE subjects you're studying</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {subjects.map((subject) => (
          <Card 
            key={subject}
            className={`p-4 cursor-pointer transition-colors ${
              isSubjectSelected(subject) ? 'border-purple-500 bg-purple-50' : ''
            }`}
            onClick={() => handleSubjectToggle(subject)}
          >
            <div className="flex items-center justify-between">
              <span>{subject}</span>
              {isSubjectSelected(subject) && (
                <Check className="h-5 w-5 text-purple-600" />
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={selectedSubjects.length === 0 || isSubmitting}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};
