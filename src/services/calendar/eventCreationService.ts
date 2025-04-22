
import { supabase } from '@/lib/supabase';
import { CalendarEvent } from '@/types/calendar';
import { checkForExistingEvents } from './eventDbUtils';

export const createDatabaseEvent = async (
  userId: string,
  eventData: Partial<CalendarEvent>
): Promise<CalendarEvent | null> => {
  if (!userId) {
    console.error('Cannot create event: Missing user ID');
    return null;
  }
  
  if (!eventData.start_time || !eventData.end_time) {
    console.error('Cannot create event: Missing start or end time');
    return null;
  }

  console.log(`Creating calendar event for user ${userId}:`, eventData);
  console.log(`Subject being saved: ${eventData.subject}`);
  
  const existingEvent = await checkForExistingEvents(userId, eventData.start_time, eventData.end_time);
  if (existingEvent) {
    return existingEvent as CalendarEvent;
  }
  
  // Ensure subject is included in the description JSON
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
    end_time: eventData.end_time,
    subject: eventData.subject // Explicitly save subject as a column
  };

  console.log('Inserting calendar event with description:', eventDescription);
  console.log('Event subject being stored:', eventData.subject);

  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(eventInsert)
      .select()
      .single();

    if (error) {
      console.error('Error creating calendar event in database:', error);
      return null;
    }

    if (!data) {
      console.error('No data returned from calendar event insert');
      return null;
    }

    console.log('Successfully created calendar event:', data);
    
    // Parse the description to get the subject if not present in data
    let subject = data.subject;
    if (!subject && data.description) {
      try {
        const descObj = JSON.parse(data.description);
        subject = descObj.subject || '';
      } catch (e) {
        console.error('Error parsing event description:', e);
      }
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      subject: subject || eventData.subject || '',
      topic: eventData.topic || '',
      start_time: data.start_time,
      end_time: data.end_time,
      event_type: data.event_type || 'study_session',
      user_id: data.user_id,
      student_id: data.student_id
    };
  } catch (insertError) {
    console.error('Exception during calendar event creation:', insertError);
    return null;
  }
};
