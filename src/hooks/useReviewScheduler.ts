
import { addDays, startOfDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface UseReviewSchedulerProps {
  sessionId?: string;
  subject: string;
  topic?: string;
}

export function useReviewScheduler({ sessionId, subject, topic }: UseReviewSchedulerProps) {
  const { toast } = useToast();

  const scheduleReviewSession = async (subject: string, topic: string, duration: number) => {
    try {
      // Find an open slot within the next 5 days
      const startDate = startOfDay(new Date());
      const endDate = addDays(startDate, 5);

      // First, get the user's availability blocks
      const { data: availabilityBlocks, error: availError } = await supabase
        .from('availability_blocks')
        .select('*')
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString());

      if (availError) throw availError;

      // Get existing calendar events in this period
      const { data: existingEvents, error: eventError } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString());

      if (eventError) throw eventError;

      // Simple slot finding logic (can be made more sophisticated later)
      const potentialSlots = availabilityBlocks.filter(block => 
        !existingEvents.some(event => 
          new Date(event.start_time) >= new Date(block.start_time) && 
          new Date(event.start_time) < new Date(block.end_time)
        )
      );

      if (potentialSlots.length === 0) {
        // No suitable slot found, log or handle accordingly
        console.log('No suitable slot found for review session');
        return;
      }

      // Select the first available slot
      const selectedSlot = potentialSlots[0];
      const startTime = new Date(selectedSlot.start_time);
      const endTime = new Date(startTime.getTime() + duration * 60000); // Convert duration to milliseconds

      // Insert review session event
      const { data: reviewSessionData, error: insertError } = await supabase
        .from('calendar_events')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          event_type: 'review_session',
          subject,
          title: `Review Session: ${topic}`,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          source_session_id: sessionId, // Link back to original session
          suggested: true
        });

      if (insertError) throw insertError;

      toast({
        title: "Review Session Scheduled",
        description: `A review session for ${topic} has been suggested in your calendar.`,
      });

    } catch (error) {
      console.error('Error scheduling review session:', error);
      toast({
        title: "Review Session Error",
        description: "Could not schedule a review session at this time.",
        variant: "destructive",
      });
    }
  };

  return { scheduleReviewSession };
}
