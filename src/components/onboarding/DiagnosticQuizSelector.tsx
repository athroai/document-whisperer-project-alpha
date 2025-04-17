
import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSubjects } from '@/hooks/useSubjects';

export const DiagnosticQuizSelector: React.FC = () => {
  const { selectedSubjects } = useOnboarding();
  const { state } = useAuth();
  const [quizResults, setQuizResults] = useState<Record<string, number>>({});
  const { subjects, isLoading } = useSubjects();

  // Use subject preferences from onboarding context
  const onboardingSubjects = selectedSubjects.map(subject => subject.subject);

  const handleQuizComplete = async (subject: string, score: number) => {
    if (!state.user) return;

    try {
      await supabase.from('diagnostic_quiz_results').insert({
        student_id: state.user.id,
        subject,
        score,
        total_questions: 10
      });

      setQuizResults(prev => ({ ...prev, [subject]: score }));
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading subjects...</div>;
  }

  // Only show subjects that were selected during onboarding
  const subjectsToShow = onboardingSubjects;
  
  // If no subjects were selected, show a message
  if (subjectsToShow.length === 0) {
    return (
      <div className="text-center py-4">
        <p>No subjects selected. Please go back to the previous step to select subjects.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p>Optional Diagnostic Quizzes: Take short quizzes to assess your current knowledge:</p>
      {subjectsToShow.map(subject => (
        <div key={subject} className="flex items-center space-x-4">
          <span className="w-32">{subject}</span>
          <Button 
            variant={quizResults[subject] ? 'outline' : 'default'}
            disabled={!!quizResults[subject]}
            onClick={() => handleQuizComplete(subject, Math.floor(Math.random() * 10))}
          >
            {quizResults[subject] 
              ? `Completed (Score: ${quizResults[subject]}/10)` 
              : 'Take Quiz'}
          </Button>
        </div>
      ))}
    </div>
  );
};
