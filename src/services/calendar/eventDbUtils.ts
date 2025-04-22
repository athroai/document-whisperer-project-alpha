
import { supabase } from '@/lib/supabase';
import { CalendarEvent } from '@/types/calendar';

export const checkForExistingEvents = async (userId: string, startTime: string, endTime: string) => {
  try {
    const { data: existingEvents } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .eq('start_time', startTime)
      .eq('end_time', endTime);
      
    if (existingEvents && existingEvents.length > 0) {
      const hasSpecificSubject = existingEvents.some(event => {
        try {
          if (event.description) {
            const data = JSON.parse(event.description);
            return !!data.subject && event.title !== 'Study Session';
          }
          return false;
        } catch (e) {
          return false;
        }
      });
      
      if (hasSpecificSubject) {
        console.log('Skipping event creation - already exists with subject for this time slot');
        const existingEvent = existingEvents.find(event => event.title !== 'Study Session') || existingEvents[0];
        return existingEvent;
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Error checking for existing events:', error);
    return null;
  }
};

export const parseEventDescription = (event: any): { subject: string; topic: string } => {
  let subject = '';
  let topic = '';
  
  try {
    if (event.description) {
      const parsed = JSON.parse(event.description);
      subject = parsed.subject || '';
      topic = parsed.topic || '';
    }
  } catch (e) {
    console.warn('Failed to parse event description:', e);
  }
  
  return { subject, topic };
};
