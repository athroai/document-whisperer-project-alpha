
import { supabase } from '@/lib/supabase';
import { CalendarEvent } from '@/types/calendar';

export const fetchDatabaseEvents = async (userId: string | null): Promise<CalendarEvent[]> => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .or(`student_id.eq.${userId},user_id.eq.${userId}`);

    if (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }

    return data.map(event => {
      let subject = '';
      let topic = '';
      
      if (event.description) {
        try {
          const parsed = JSON.parse(event.description);
          subject = parsed.subject || '';
          topic = parsed.topic || '';
        } catch (e) {
          console.warn('Failed to parse event description:', e);
        }
      }
      
      return {
        id: event.id,
        title: event.title,
        description: event.description,
        subject,
        topic,
        start_time: event.start_time,
        end_time: event.end_time,
        event_type: event.event_type || 'study_session',
        user_id: event.user_id,
        student_id: event.student_id
      };
    });
  } catch (error) {
    console.error('Database error fetching events:', error);
    return [];
  }
};

export const createDatabaseEvent = async (
  userId: string,
  eventData: Partial<CalendarEvent>
): Promise<CalendarEvent | null> => {
  const eventDescription = JSON.stringify({
    subject: eventData.subject || '',
    topic: eventData.topic || '',
    isPomodoro: true,
    pomodoroWorkMinutes: 25,
    pomodoroBreakMinutes: 5
  });

  const eventInsert = {
    title: eventData.title || `${eventData.subject || 'Study'} Session`,
    description: eventDescription,
    user_id: userId,
    student_id: userId,
    event_type: eventData.event_type || 'study_session',
    start_time: eventData.start_time,
    end_time: eventData.end_time
  };

  const { data, error } = await supabase
    .from('calendar_events')
    .insert(eventInsert)
    .select()
    .single();

  if (error) {
    console.error('Error creating calendar event in database:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    subject: eventData.subject || '',
    topic: eventData.topic || '',
    start_time: data.start_time,
    end_time: data.end_time,
    event_type: data.event_type || 'study_session',
    user_id: data.user_id,
    student_id: data.student_id
  };
};
