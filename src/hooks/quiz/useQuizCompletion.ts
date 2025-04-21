
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ConfidenceLabel } from '@/types/confidence';

// Helper function to map score to confidence
function mapScoreToConfidence(score: number): ConfidenceLabel {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

export const useQuizCompletion = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { state } = useAuth();
  
  const completeQuiz = async (
    subject: string, 
    topic: string | null, 
    score: number, 
    maxScore: number,
    durationSeconds: number
  ) => {
    if (!state.user) {
      setError("You must be logged in to save quiz results");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const confidence = mapScoreToConfidence(Math.round((score / maxScore) * 100));
      
      const { error: quizError } = await supabase
        .from('quiz_results')
        .insert({
          student_id: state.user.id,
          score,
          max_score: maxScore,
          subject,
          topic: topic || undefined,
          duration: durationSeconds
        });
        
      if (quizError) throw quizError;
      
      // Also update progress signals
      const { error: progressError } = await supabase
        .from('ai_progress_signals')
        .upsert({
          user_id: state.user.id,
          subject,
          topic: topic || subject,
          avg_confidence: confidence === 'high' ? 8 : confidence === 'medium' ? 5 : 2,
          last_confidence: confidence
        }, { 
          onConflict: 'user_id, subject, topic' 
        });
        
      if (progressError) throw progressError;
      
      setSuccess(true);
    } catch (err: any) {
      console.error("Error saving quiz results:", err);
      setError(err.message || "Failed to save quiz results");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    completeQuiz,
    isSubmitting,
    error,
    success
  };
};
