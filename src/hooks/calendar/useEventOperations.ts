import { CalendarEvent } from '@/types/calendar';
import { createDatabaseEvent } from '@/services/calendarEventService';
import { supabase } from '@/lib/supabase';
import { useLocalCalendarEvents } from './useLocalCalendarEvents';

export const useEventOperations = (
  events: CalendarEvent[],
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>
) => {
  const { saveLocalEvent } = useLocalCalendarEvents();

  const createEvent = async (eventData: Partial<CalendarEvent>, useLocalFallback = true): Promise<CalendarEvent | null> => {
    try {
      const { auth } = supabase;
      const session = auth.session();
      const userId = session?.user?.id;
      
      if (!userId) {
        if (useLocalFallback) {
          console.log('No authenticated user, saving event locally');
          // Create a local event with temporary ID
          const localEvent: CalendarEvent = {
            id: `local-${Date.now()}`,
            title: eventData.title || 'Study Session',
            subject: eventData.subject || 'General',
            description: '',
            topic: eventData.topic || '',
            start_time: eventData.start_time || new Date().toISOString(),
            end_time: eventData.end_time || new Date().toISOString(),
            event_type: eventData.event_type || 'study_session',
            user_id: 'local',
            student_id: 'local'
          };
          
          const saved = saveLocalEvent(localEvent);
          if (saved) {
            setEvents(prev => [...prev, localEvent]);
            return localEvent;
          }
          return null;
        } else {
          console.error('Cannot create event: No authenticated user');
          return null;
        }
      }
      
      // Try to create in database
      const newEvent = await createDatabaseEvent(userId, eventData);
      
      if (newEvent) {
        setEvents(prev => [...prev, newEvent]);
        return newEvent;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> => {
    try {
      // If it's a local event
      if (eventId.startsWith('local-')) {
        const updatedEvents = events.map(event => 
          event.id === eventId ? { ...event, ...updates } : event
        );
        setEvents(updatedEvents);
        
        // Update in local storage
        try {
          localStorage.setItem('cached_calendar_events', JSON.stringify(
            updatedEvents.filter(e => e.id.startsWith('local-'))
          ));
        } catch (e) {
          console.error('Failed to update local storage:', e);
        }
        
        return updatedEvents.find(e => e.id === eventId) || null;
      }
      
      // Otherwise update in database
      const { data, error } = await supabase
        .from('calendar_events')
        .update({
          title: updates.title,
          description: updates.description ? JSON.stringify({
            subject: updates.subject || '',
            topic: updates.topic || '',
            isPomodoro: true,
            pomodoroWorkMinutes: 25,
            pomodoroBreakMinutes: 5
          }) : undefined,
          start_time: updates.start_time,
          end_time: updates.end_time,
          event_type: updates.event_type
        })
        .eq('id', eventId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating event:', error);
        return null;
      }
      
      if (!data) {
        return null;
      }
      
      const updatedEvent = {
        ...data,
        subject: updates.subject || '',
        topic: updates.topic || '',
      };
      
      setEvents(prev => prev.map(event => 
        event.id === eventId ? updatedEvent : event
      ));
      
      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      return null;
    }
  };

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    try {
      // If it's a local event
      if (eventId.startsWith('local-')) {
        const updatedEvents = events.filter(event => event.id !== eventId);
        setEvents(updatedEvents);
        
        // Update in local storage
        try {
          localStorage.setItem('cached_calendar_events', JSON.stringify(
            updatedEvents.filter(e => e.id.startsWith('local-'))
          ));
        } catch (e) {
          console.error('Failed to update local storage:', e);
        }
        
        return true;
      }
      
      // Otherwise delete from database
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);
      
      if (error) {
        console.error('Error deleting event:', error);
        return false;
      }
      
      setEvents(prev => prev.filter(event => event.id !== eventId));
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  };

  return { createEvent, updateEvent, deleteEvent };
};
