
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Plus } from 'lucide-react';
import { GCSE_SUBJECTS } from '@/hooks/useSubjects';
import { useToast } from '@/hooks/use-toast';
import { ConfidenceLabel } from '@/types/confidence';

export const SubjectsSelector: React.FC = () => {
  const { selectedSubjects, selectSubject, removeSubject, updateOnboardingStep } = useOnboarding();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show guidance toast when component mounts
    toast({
      title: "Subject Selection",
      description: "Select the subjects you're studying and indicate your confidence level in each one.",
    });
  }, [toast]);

  const handleContinue = () => {
    if (selectedSubjects.length === 0) {
      toast({
        title: "No Subjects Selected",
        description: "Please select at least one subject before continuing.",
        variant: "destructive"
      });
      return;
    }

    // Update onboarding step to move to next page
    updateOnboardingStep('availability');
  };

  // Sort subjects alphabetically
  const sortedSubjects = [...GCSE_SUBJECTS].sort();
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Select Your Subjects</h2>
        <p className="text-muted-foreground mt-1">
          Choose the subjects you're studying for GCSE and rate your confidence level.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {sortedSubjects.map(subject => {
          const selected = selectedSubjects.find(s => s.subject === subject);
          return (
            <div 
              key={subject}
              className={`p-4 border rounded-md transition-all ${
                selected ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{subject}</span>
                {!selected ? (
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => selectSubject(subject, 'medium')} 
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => removeSubject(subject)}
                    disabled={isLoading}
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              {selected && (
                <div className="mt-3">
                  <span className="text-sm mb-1 block">Confidence Level:</span>
                  <div className="flex space-x-2">
                    {(['low', 'medium', 'high'] as ConfidenceLabel[]).map((level) => (
                      <Button 
                        key={level} 
                        size="sm"
                        variant={selected.confidence === level ? "default" : "outline"}
                        className={selected.confidence === level ? "bg-purple-600" : ""}
                        onClick={() => selectSubject(subject, level)}
                        disabled={isLoading}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                        {selected.confidence === level && <Check className="ml-2 h-3 w-3" />}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleContinue} disabled={isLoading || selectedSubjects.length === 0}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
};
