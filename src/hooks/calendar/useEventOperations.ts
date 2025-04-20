
import { useCallback } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useDbCalendarEvents } from './useDbCalendarEvents';
import { useLocalCalendarEvents } from './useLocalCalendarEvents';

export const useEventOperations = (
  events: CalendarEvent[],
  setEvents: (events: CalendarEvent[]) => void
) => {
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const {
    createDbEvent,
    updateDbEvent,
    deleteDbEvent
  } = useDbCalendarEvents();
  
  const {
    addLocalEvent,
    updateLocalEvent,
    deleteLocalEvent
  } = useLocalCalendarEvents();

  const createEvent = async (
    eventData: Partial<CalendarEvent>,
    allowLocalFallback: boolean = false
  ): Promise<CalendarEvent> => {
    try {
      const currentUserId = authState.user?.id;
      
      if (!currentUserId) {
        if (!allowLocalFallback) {
          throw new Error('No authenticated user found');
        }
        throw new Error('No user found for database operation');
      }

      const newEvent = await createDbEvent(currentUserId, eventData);
      
      if (newEvent) {
        setEvents(prevEvents => [...prevEvents, newEvent]);
        toast({
          title: "Success",
          description: "Study session created successfully.",
        });
        return newEvent;
      }
      
      throw new Error('Failed to create database event');
      
    } catch (error) {
      console.error('Error creating calendar event:', error);
      
      if (!allowLocalFallback) {
        throw error;
      }
      
      const localId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const localEvent: CalendarEvent = {
        id: localId,
        title: eventData.title || `${eventData.subject || 'Study'} Session`,
        subject: eventData.subject || '',
        topic: eventData.topic || '',
        start_time: eventData.start_time!,
        end_time: eventData.end_time!,
        event_type: eventData.event_type || 'study_session',
        local_only: true
      };
      
      addLocalEvent(localEvent);
      setEvents(prev => [...prev, localEvent]);
      
      return localEvent;
    }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>): Promise<boolean> => {
    const isLocalEvent = id.startsWith('local-');
    
    if (isLocalEvent) {
      const success = updateLocalEvent(id, updates);
      if (success) {
        setEvents(prevEvents => 
          prevEvents.map(event => event.id === id ? { ...event, ...updates } : event)
        );
      }
      return success;
    }
    
    const success = await updateDbEvent(id, updates);
    if (success) {
      setEvents(prevEvents => 
        prevEvents.map(event => event.id === id ? { ...event, ...updates } : event)
      );
    }
    return success;
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    const isLocalEvent = id.startsWith('local-');
    
    if (isLocalEvent) {
      const success = deleteLocalEvent(id);
      if (success) {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
      }
      return success;
    }
    
    const success = await deleteDbEvent(id);
    if (success) {
      setEvents(events.filter(event => event.id !== id));
    }
    return success;
  };

  return {
    createEvent,
    updateEvent,
    deleteEvent
  };
};
