
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { addDays } from 'date-fns';

interface UseReviewSchedulerProps {
  sessionId?: string;
  subject: string;
  topic?: string;
}

export function useReviewScheduler({
  sessionId,
  subject,
  topic
}: UseReviewSchedulerProps) {
  const { state } = useAuth();
  const { toast } = useToast();
  const [isScheduling, setIsScheduling] = useState(false);

  const scheduleReviewSession = async (
    subject: string, 
    topic?: string, 
    durationMinutes: number = 30
  ) => {
    if (!state.user || !state.user.id) {
      console.error('Cannot schedule review: User not authenticated');
      return;
    }
    
    setIsScheduling(true);
    
    try {
      // Schedule review 2-3 days from now
      const reviewDate = addDays(new Date(), 2 + Math.floor(Math.random() * 2));
      
      // Set to a reasonable time (4 PM)
      reviewDate.setHours(16, 0, 0, 0);
      
      // End time based on duration
      const endDate = new Date(reviewDate.getTime() + durationMinutes * 60000);
      
      // Create session description
      const sessionDescription = JSON.stringify({
        subject,
        topic,
        description: `Review session for ${subject}${topic ? ` on ${topic}` : ''}.`,
        isReview: true
      });
      
      // Create calendar event
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          title: `Review: ${subject}${topic ? ` - ${topic}` : ''}`,
          start_time: reviewDate.toISOString(),
          end_time: endDate.toISOString(),
          event_type: 'study_session',
          description: sessionDescription,
          student_id: state.user.id,
          source_session_id: sessionId,
          suggested: true
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: 'Review Session Scheduled',
        description: `A review session has been added to your calendar for ${reviewDate.toLocaleDateString()}.`,
      });
      
      return data?.[0]?.id;
    } catch (error) {
      console.error('Error scheduling review session:', error);
      toast({
        title: 'Error',
        description: 'There was a problem scheduling your review session.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsScheduling(false);
    }
  };

  return { scheduleReviewSession, isScheduling };
}
