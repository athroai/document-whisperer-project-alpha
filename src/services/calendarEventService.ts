
import { supabase } from '@/lib/supabase';
import { CalendarEvent } from '@/types/calendar';

export const fetchDatabaseEvents = async (userId: string | null): Promise<CalendarEvent[]> => {
  if (!userId) {
    console.log('No user ID provided to fetchDatabaseEvents');
    return [];
  }

  try {
    console.log(`Fetching events from database for user: ${userId}`);
    
    // Try to get both user events and student events
    const [userEventsResult, studentEventsResult] = await Promise.allSettled([
      supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: true }),
      supabase
        .from('calendar_events')
        .select('*')
        .eq('student_id', userId)
        .neq('user_id', userId)
        .order('start_time', { ascending: true })
    ]);
    
    // Handle user events
    let userEvents: any[] = [];
    if (userEventsResult.status === 'fulfilled') {
      if (userEventsResult.value.error) {
        console.error('Error fetching user calendar events:', userEventsResult.value.error);
      } else {
        userEvents = userEventsResult.value.data || [];
        console.log(`Fetched ${userEvents.length} events where user_id = ${userId}`);
      }
    }
    
    // Handle student events
    let studentEvents: any[] = [];
    if (studentEventsResult.status === 'fulfilled') {
      if (studentEventsResult.value.error) {
        console.error('Error fetching student calendar events:', studentEventsResult.value.error);
      } else {
        studentEvents = studentEventsResult.value.data || [];
        console.log(`Fetched ${studentEvents.length} events where student_id = ${userId} and user_id != ${userId}`);
      }
    }
    
    const allEvents = [...userEvents, ...studentEvents];
    console.log(`Total events fetched: ${allEvents.length}`);

    return allEvents.map(event => {
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
  if (!userId) {
    console.error('Cannot create event: Missing user ID');
    return null;
  }
  
  if (!eventData.start_time || !eventData.end_time) {
    console.error('Cannot create event: Missing start or end time');
    return null;
  }

  console.log(`Creating calendar event for user ${userId}:`, eventData);
  
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

  console.log('Inserting calendar event:', eventInsert);

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
  } catch (insertError) {
    console.error('Exception during calendar event creation:', insertError);
    return null;
  }
};
