
import { supabase } from '@/lib/supabase';
import { CalendarEvent } from '@/types/calendar';

export const fetchDatabaseEvents = async (userId: string | null): Promise<CalendarEvent[]> => {
  if (!userId) {
    console.log('No user ID provided to fetchDatabaseEvents');
    return [];
  }

  try {
    console.log(`Fetching events from database for user: ${userId}`);
    
    // Split into separate queries for better error handling
    const [userEventsResult, studentEventsResult] = await Promise.all([
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
    
    if (userEventsResult.error) {
      console.error('Error fetching user calendar events:', userEventsResult.error);
      return [];
    }
    
    if (studentEventsResult.error) {
      console.error('Error fetching student calendar events:', studentEventsResult.error);
      return userEventsResult.data || [];
    }
    
    const userEvents = userEventsResult.data || [];
    const studentEvents = studentEventsResult.data || [];
    
    console.log(`Fetched ${userEvents.length} user events and ${studentEvents.length} student events`);
    
    const allEvents = [...userEvents, ...studentEvents];

    if (allEvents.length === 0) {
      console.log('No calendar events found in the database for this user');
    } else {
      console.log(`Successfully fetched ${allEvents.length} total calendar events`);
      
      // Check for events with malformed dates
      const validEvents = allEvents.filter(event => {
        try {
          // Validate that dates are parseable
          new Date(event.start_time);
          new Date(event.end_time);
          return true;
        } catch (e) {
          console.error('Found event with invalid date format:', event.id);
          return false;
        }
      });
      
      if (validEvents.length !== allEvents.length) {
        console.warn(`Filtered out ${allEvents.length - validEvents.length} events with invalid dates`);
      }
    }
    
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
