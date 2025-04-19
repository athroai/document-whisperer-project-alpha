
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ConfidenceLabel } from '@/types/confidence';

export const useQuizCompletion = (
  quizId: string,
  sessionId: string,
  subject: string,
  totalQuestions: number
) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { state } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async (
    score: number,
    answeredQuestions: number,
    timeSpentSeconds: number,
    confidenceRating: 'Very Low' | 'Low' | 'Neutral' | 'High' | 'Very High'
  ) => {
    if (!state.user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save quiz results',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const percentageScore = Math.round((score / totalQuestions) * 100);
      
      // Determine confidence change
      let confidenceChange = 0;
      if (percentageScore >= 80) {
        confidenceChange = 1;
      } else if (percentageScore >= 60) {
        confidenceChange = 0.5;
      } else if (percentageScore <= 30) {
        confidenceChange = -1;
      } else if (percentageScore <= 50) {
        confidenceChange = -0.5;
      }
      
      // Save quiz results to database
      const { error } = await supabase
        .from('quiz_sessions')
        .update({
          end_time: new Date().toISOString(),
          score,
          total_questions: totalQuestions,
          answered_questions: answeredQuestions,
          time_spent_seconds: timeSpentSeconds,
          confidence_rating: confidenceRating as ConfidenceLabel,
          confidence_change: confidenceChange,
          is_completed: true
        })
        .eq('id', sessionId);
      
      if (error) {
        throw new Error(`Failed to save quiz results: ${error.message}`);
      }
      
      // Update user's subject confidence
      try {
        // Get current confidence
        const { data: existingConfidence } = await supabase
          .from('student_subject_confidence')
          .select('confidence_score')
          .eq('student_id', state.user.id)
          .eq('subject', subject)
          .single();
        
        if (existingConfidence) {
          // Update existing confidence
          const newConfidence = Math.min(
            Math.max(existingConfidence.confidence_score + confidenceChange, 1),
            5
          );
          
          await supabase
            .from('student_subject_confidence')
            .update({
              confidence_score: newConfidence,
              updated_at: new Date().toISOString()
            })
            .eq('student_id', state.user.id)
            .eq('subject', subject);
        } else {
          // Create new confidence record
          const baseConfidence = 3; // Start at neutral
          const newConfidence = Math.min(Math.max(baseConfidence + confidenceChange, 1), 5);
          
          await supabase
            .from('student_subject_confidence')
            .insert({
              student_id: state.user.id,
              subject,
              confidence_score: newConfidence
            });
        }
      } catch (confidenceError) {
        console.error('Failed to update confidence:', confidenceError);
        // Don't fail the whole operation for this
      }
      
      toast({
        title: 'Quiz Completed!',
        description: `You scored ${percentageScore}%`,
      });
      
      // Navigate to summary page
      navigate(`/quiz/summary/${quizId}`, {
        state: {
          score,
          totalQuestions,
          percentageScore,
          subject,
          confidenceRating,
          confidenceChange
        }
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete quiz',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleComplete,
    isSubmitting
  };
};
