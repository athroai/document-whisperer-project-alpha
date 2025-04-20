import { ConfidenceLabel } from '@/types/confidence';
import { supabase } from '@/lib/supabase';
import { addDays, format } from 'date-fns';
import { PreferredStudySlot } from '@/types/study';

export const generateDefaultStudySlots = (userId: string): PreferredStudySlot[] => {
  const defaultSlots = [];
  
  for (let day = 1; day <= 5; day++) {
    defaultSlots.push({
      id: `default-${day}`,
      user_id: userId,
      day_of_week: day,
      slot_count: 2,
      slot_duration_minutes: 45,
      preferred_start_hour: 16
    });
  }
  
  return defaultSlots;
};

export const saveSessionsToDatabase = async (
  sessions: any[],
  userId: string,
  planId: string
): Promise<string[]> => {
  const eventIds: string[] = [];
  
  for (const session of sessions) {
    try {
      const eventDescription = {
        subject: session.subject,
        confidence: session.confidence,
        isPomodoro: true,
        pomodoroWorkMinutes: 25,
        pomodoroBreakMinutes: 5
      };

      const { data: eventData, error: eventError } = await supabase
        .from('calendar_events')
        .insert({
          user_id: userId,
          student_id: userId,
          title: `${session.subject} Study Session`,
          description: JSON.stringify(eventDescription),
          event_type: 'study_session',
          start_time: session.startTime.toISOString(),
          end_time: session.endTime.toISOString()
        })
        .select('id')
        .single();

      if (eventError) {
        console.error("Error creating calendar event:", eventError);
        eventIds.push("");
        continue;
      }

      if (!eventData?.id) {
        console.error("No event ID returned");
        eventIds.push("");
        continue;
      }

      // Create study plan session
      const { error: sessionError } = await supabase
        .from('study_plan_sessions')
        .insert({
          plan_id: planId,
          subject: session.subject,
          topic: '',
          start_time: session.startTime.toISOString(),
          end_time: session.endTime.toISOString(),
          calendar_event_id: eventData.id
        });

      if (sessionError) {
        console.error("Error creating study plan session:", sessionError);
      }

      eventIds.push(eventData.id);
    } catch (err) {
      console.error("Exception when saving session:", err);
      eventIds.push("");
    }
  }

  return eventIds;
};
