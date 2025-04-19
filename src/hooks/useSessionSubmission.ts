
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { AthroMessage } from '@/types/athro';
import { useReviewScheduler } from './useReviewScheduler';
import { useAuth } from '@/contexts/AuthContext';

interface UseSessionSubmissionProps {
  sessionId?: string;
  subject: string;
  topic?: string;
  messages: AthroMessage[];
  confidenceBefore?: number;
  onSessionEnd: () => void;
}

export function useSessionSubmission({
  sessionId,
  subject,
  topic,
  messages,
  confidenceBefore,
  onSessionEnd
}: UseSessionSubmissionProps) {
  const { toast } = useToast();
  const { scheduleReviewSession } = useReviewScheduler({ sessionId, subject, topic });
  const { state } = useAuth();

  const handleSubmitFeedback = async (confidenceAfter: number, feedback: string, sessionSummary: string) => {
    if (!state.user || !state.user.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    const needsReview = confidenceAfter < 5;
    
    try {
      const confidenceLabel = confidenceAfter >= 8 ? 'high' : 
                               confidenceAfter >= 5 ? 'medium' : 'low';

      const { data: existingProgress, error: fetchError } = await supabase
        .from('ai_progress_signals')
        .select('*')
        .eq('user_id', state.user.id)
        .eq('subject', subject)
        .eq('topic', topic || 'general')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const newSessionsCount = existingProgress 
        ? existingProgress.sessions_count + 1 
        : 1;
      
      const newAvgConfidence = existingProgress
        ? ((existingProgress.avg_confidence * existingProgress.sessions_count) + confidenceAfter) / newSessionsCount
        : confidenceAfter;

      const upsertData = {
        user_id: state.user.id,
        subject,
        topic: topic || 'general',
        sessions_count: newSessionsCount,
        avg_confidence: newAvgConfidence,
        last_confidence: confidenceLabel,
        needs_review: needsReview,
        last_session_id: sessionId,
        updated_at: new Date().toISOString()
      };

      const { error: upsertError } = await supabase
        .from('ai_progress_signals')
        .upsert(upsertData, { 
          onConflict: 'user_id,subject,topic'
        });

      if (upsertError) throw upsertError;

      const originalSessionDuration = messages.length > 1 
        ? Math.round((new Date(messages[messages.length - 1].timestamp).getTime() - 
                      new Date(messages[0].timestamp).getTime()) / 60000) 
        : 50;

      if (needsReview && topic) {
        await scheduleReviewSession(subject, topic, originalSessionDuration);
      }

      if (!sessionId) {
        try {
          const { data: sessionData, error } = await supabase
            .from('study_sessions')
            .insert({
              subject,
              topic,
              start_time: new Date(messages[0]?.timestamp || new Date()).toISOString(),
              end_time: new Date().toISOString(),
              confidence_before: confidenceBefore,
              confidence_after: confidenceAfter,
              notes: feedback,
              summary: sessionSummary,
              needs_review: needsReview,
              status: 'completed',
              transcript: JSON.stringify(messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp
              })))
            })
            .select()
            .single();
            
          if (error) throw error;
          
          toast({
            title: "Session Completed",
            description: "Your study session has been saved.",
          });
        } catch (error) {
          console.error('Error recording session:', error);
          toast({
            title: "Error",
            description: "There was a problem saving your session.",
            variant: "destructive",
          });
        }
      } else {
        try {
          await supabase
            .from('study_sessions')
            .update({
              end_time: new Date().toISOString(),
              confidence_after: confidenceAfter,
              notes: feedback,
              summary: sessionSummary,
              needs_review: needsReview,
              status: 'completed'
            })
            .eq('id', sessionId);
              
          toast({
            title: "Session Completed",
            description: "Your study session has been saved.",
          });
        } catch (error) {
          console.error('Error updating session record:', error);
          toast({
            title: "Error",
            description: "There was a problem updating your session.",
            variant: "destructive",
          });
        }
      }
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('confidence_scores')
          .single();
        
        if (data) {
          const confidenceScores = data.confidence_scores || {};
          confidenceScores[subject] = confidenceAfter;
          
          await supabase
            .from('profiles')
            .update({ confidence_scores: confidenceScores })
            .eq('id', (await supabase.auth.getUser()).data.user?.id);
        }
      } catch (error) {
        console.error('Error updating confidence scores:', error);
      }
      
      onSessionEnd();
    } catch (error) {
      console.error('Error updating progress signals:', error);
      toast({
        title: "Error",
        description: "There was a problem saving your session progress.",
        variant: "destructive",
      });
    }
  };

  return { handleSubmitFeedback };
}
