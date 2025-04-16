
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { AthroMessage } from '@/types/athro';
import { useReviewScheduler } from './useReviewScheduler';

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
  
  const handleSubmitFeedback = async (confidenceAfter: number, feedback: string, sessionSummary: string) => {
    const needsReview = confidenceAfter < 5; // Tag for review if confidence is still low
    
    try {
      // Update study session record
      const sessionUpdateData = {
        end_time: new Date().toISOString(),
        confidence_after: confidenceAfter,
        notes: feedback,
        summary: sessionSummary,
        needs_review: needsReview,
        status: 'completed'
      };

      // Determine the original session's duration
      const originalSessionDuration = messages.length > 1 
        ? Math.round((new Date(messages[messages.length - 1].timestamp).getTime() - 
                      new Date(messages[0].timestamp).getTime()) / 60000) 
        : 50; // Default to 50 minutes if can't calculate

      // If confidence is low, schedule a review session
      if (needsReview && topic) {
        await scheduleReviewSession(subject, topic, originalSessionDuration);
      }

      if (!sessionId) {
        // Create a new session record if this wasn't from a calendar event
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
                role: msg.senderId === 'user' ? 'user' : 'assistant',
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
        // Update existing session record
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
      
      // Update user's confidence score for this subject
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
      console.error('Error submitting feedback and scheduling review:', error);
      toast({
        title: "Error",
        description: "There was a problem saving your session and scheduling a review.",
        variant: "destructive",
      });
    }
  };

  return { handleSubmitFeedback };
}
