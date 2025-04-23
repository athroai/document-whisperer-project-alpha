
import { supabase } from '@/lib/supabase';
import { CalendarEvent } from '@/types/calendar';
import { parseEventDescription } from './eventDbUtils';

export const fetchDatabaseEvents = async (userId: string | null): Promise<CalendarEvent[]> => {
  if (!userId) {
    console.log('No user ID provided to fetchDatabaseEvents');
    return [];
  }

  try {
    console.log(`Fetching events from database for user: ${userId}`);
    
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
    
    let userEvents: any[] = [];
    if (userEventsResult.status === 'fulfilled') {
      if (userEventsResult.value.error) {
        console.error('Error fetching user calendar events:', userEventsResult.value.error);
      } else {
        userEvents = userEventsResult.value.data || [];
        console.log(`Fetched ${userEvents.length} events where user_id = ${userId}`);
      }
    }
    
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

    const uniqueEvents = new Map();
    
    allEvents.forEach(event => {
      const key = `${event.start_time}-${event.end_time}`;
      if (!uniqueEvents.has(key) || 
          (event.title !== 'Study Session' && uniqueEvents.get(key).title === 'Study Session')) {
        uniqueEvents.set(key, event);
      }
    });
    
    const dedupedEvents = Array.from(uniqueEvents.values());
    console.log(`After deduplication: ${dedupedEvents.length} events`);

    return dedupedEvents.map(event => {
      const { subject, topic } = parseEventDescription(event);
      
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
