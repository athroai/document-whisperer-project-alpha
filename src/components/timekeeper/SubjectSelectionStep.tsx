
import React, { useEffect, useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Check, Loader2, ArrowRight } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ConfidenceLevel = 'low' | 'medium' | 'high';

export const TimeKeeperSubjectSelection: React.FC = () => {
  const { selectedSubjects, selectSubject, removeSubject, updateOnboardingStep } = useOnboarding();
  const { allSubjects, isLoading } = useSubjects();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const { state: authState } = useAuth();

  // Track if we've shown the initial guidance toast
  const [guidanceShown, setGuidanceShown] = useState(false);
  
  useEffect(() => {
    if (!isLoading && !guidanceShown) {
      toast({
        title: "Welcome to the Timekeeper Zone",
        description: "Let's start by selecting your GCSE subjects and rating how confident you feel about each one.",
      });
      setGuidanceShown(true);
    }
  }, [isLoading, guidanceShown, toast]);

  const isSubjectSelected = (subject: string) => {
    return selectedSubjects.some(s => s.subject === subject);
  };

  const getSubjectConfidence = (subject: string): ConfidenceLevel => {
    const foundSubject = selectedSubjects.find(s => s.subject === subject);
    return (foundSubject?.confidence as ConfidenceLevel) || 'medium';
  };

  const handleSubjectToggle = async (subject: string) => {
    setIsSaving(true);
    try {
      if (isSubjectSelected(subject)) {
        removeSubject(subject);
        // Also remove from database if user is authenticated
        if (authState.user?.id) {
          await supabase
            .from('student_subject_preferences')
            .delete()
            .eq('student_id', authState.user.id)
            .eq('subject', subject);
        }
      } else {
        selectSubject(subject, "medium");
        // Also add to database if user is authenticated
        if (authState.user?.id) {
          await supabase
            .from('student_subject_preferences')
            .upsert({
              student_id: authState.user.id,
              subject: subject,
              confidence_level: 5 // Using numeric value for database
            });
        }
      }
    } catch (err) {
      console.error('Error toggling subject:', err);
      toast({
        title: "Error",
        description: "There was a problem updating your subject. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSubjectConfidence = async (subject: string, confidence: ConfidenceLevel) => {
    setIsSaving(true);
    try {
      // First update in context
      selectSubject(subject, confidence);
      
      // Then update in database if authenticated
      if (authState.user?.id) {
        const confidenceValue = 
          confidence === 'low' ? 3 : 
          confidence === 'medium' ? 5 :
          confidence === 'high' ? 8 : 5;
        
        await supabase
          .from('student_subject_preferences')
          .upsert({
            student_id: authState.user.id,
            subject,
            confidence_level: confidenceValue
          });
      }
    } catch (err) {
      console.error('Error updating confidence:', err);
      toast({
        title: "Error",
        description: "There was a problem updating your confidence level. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = () => {
    if (selectedSubjects.length === 0) {
      toast({
        title: "No subjects selected",
        description: "Please select at least one subject before continuing.",
        variant: "destructive"
      });
      return;
    }
    updateOnboardingStep('availability');
  };

  const getConfidenceColor = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case 'low': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'medium': return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'high': return 'bg-green-100 text-green-800 hover:bg-green-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2">Loading your subjects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Select Your GCSE Subjects</h2>
        <p className="text-muted-foreground mt-1">
          Choose the subjects you're studying and rate your confidence level in each one.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {allSubjects.map((subject) => {
          const isSelected = isSubjectSelected(subject);
          const confidence = getSubjectConfidence(subject);
          
          return (
            <Card 
              key={subject} 
              className={`p-4 cursor-pointer transition-all ${isSelected ? 'border-purple-300 shadow-md' : ''}`}
              onClick={() => handleSubjectToggle(subject)}
            >
              <div className="flex justify-between items-start">
                <div className="font-medium">{subject}</div>
                <Button 
                  size="sm" 
                  variant={isSelected ? "default" : "outline"}
                  className={isSelected ? "bg-purple-600 hover:bg-purple-700" : ""}
                  disabled={isSaving}
                >
                  {isSelected ? <Check className="h-4 w-4" /> : "Select"}
                </Button>
              </div>
              
              {isSelected && (
                <div className="mt-3 grid grid-cols-3 gap-1">
                  <Button 
                    size="sm"
                    variant="outline"
                    className={`${confidence === 'low' ? getConfidenceColor('low') + ' border-red-300' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation(); 
                      updateSubjectConfidence(subject, 'low');
                    }}
                  >
                    Low
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className={`${confidence === 'medium' ? getConfidenceColor('medium') + ' border-amber-300' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation(); 
                      updateSubjectConfidence(subject, 'medium');
                    }}
                  >
                    Medium
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className={`${confidence === 'high' ? getConfidenceColor('high') + ' border-green-300' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation(); 
                      updateSubjectConfidence(subject, 'high');
                    }}
                  >
                    High
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {selectedSubjects.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">Your selected subjects:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedSubjects.map(({ subject, confidence }) => (
              <Badge 
                key={subject} 
                className={getConfidenceColor(confidence as ConfidenceLevel)}
              >
                {subject} ({confidence})
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleContinue}
          disabled={selectedSubjects.length === 0 || isSaving}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
