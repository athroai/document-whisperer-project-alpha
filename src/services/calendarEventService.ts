
import { supabase } from '@/lib/supabase';
import { CalendarEvent } from '@/types/calendar';

export const fetchDatabaseEvents = async (userId: string | null): Promise<CalendarEvent[]> => {
  if (!userId) {
    console.log('No user ID provided to fetchDatabaseEvents');
    return [];
  }

  try {
    console.log(`Fetching events from database for user: ${userId}`);
    
    // First attempt to get events where the user is explicitly the user_id
    const { data: userEvents, error: userError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId);
      
    if (userError) {
      console.error('Error fetching user calendar events:', userError);
      return [];
    }
    
    console.log(`Found ${userEvents?.length || 0} events with user_id match`);
    
    // Then get events where the user is the student_id (might be different in some cases)
    const { data: studentEvents, error: studentError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('student_id', userId)
      .neq('user_id', userId); // Don't duplicate events we already got
      
    if (studentError) {
      console.error('Error fetching student calendar events:', studentError);
      // Continue with just the user events
    } else {
      console.log(`Found ${studentEvents?.length || 0} additional events with student_id match`);
    }

    // Combine both sets of events
    const allEvents = [...(userEvents || []), ...(studentEvents || [])];
    console.log(`Fetched ${allEvents.length} total calendar events from database`);
    
    // Add detailed logging about the events
    if (allEvents.length > 0) {
      console.log(`First event: ${JSON.stringify(allEvents[0])}`);
      
      // Log distribution of event types
      const eventTypes = allEvents.reduce((acc: Record<string, number>, event) => {
        acc[event.event_type || 'unknown'] = (acc[event.event_type || 'unknown'] || 0) + 1;
        return acc;
      }, {});
      console.log('Event type distribution:', eventTypes);
    } else {
      console.warn('No events found in database for user:', userId);
      
      // Check if there are any events at all in the table (for debugging)
      const { count, error } = await supabase
        .from('calendar_events')
        .select('*', { count: 'exact', head: true });
        
      if (error) {
        console.error('Error checking total event count:', error);
      } else {
        console.log(`Total events in database: ${count}`);
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

  const { data, error } = await supabase
    .from('calendar_events')
    .insert(eventInsert)
    .select()
    .single();

  if (error) {
    console.error('Error creating calendar event in database:', error);
    return null;
  }

  console.log('Successfully created calendar event:', data);

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
