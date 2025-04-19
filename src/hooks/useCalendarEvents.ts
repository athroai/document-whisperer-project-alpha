import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSuggestedEvents } from './calendar/useSuggestedEvents';
import { useLocalCalendarEvents } from './calendar/useLocalCalendarEvents';
import { useDbCalendarEvents } from './calendar/useDbCalendarEvents';
import { fetchDatabaseEvents } from '@/services/calendarEventService';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { state: authState } = useAuth();
  
  const {
    localEvents,
    addLocalEvent,
    updateLocalEvent,
    deleteLocalEvent,
    clearLocalEvents
  } = useLocalCalendarEvents();
  
  const {
    suggestedEvents,
    generateSuggestedSessions,
    acceptSuggestedEvent
  } = useSuggestedEvents(events);
  
  const {
    createDbEvent,
    updateDbEvent,
    deleteDbEvent
  } = useDbCalendarEvents();

  const clearEvents = useCallback(() => {
    setEvents([]);
    clearLocalEvents();
  }, [clearLocalEvents]);

  const getCurrentUserId = useCallback(() => {
    return authState.user?.id || null;
  }, [authState.user]);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const userId = getCurrentUserId();
      
      if (!userId) {
        console.log('No authenticated user, not fetching calendar events');
        setEvents([]);
        return [];
      }

      console.log(`Fetching calendar events for user ${userId}`);
      const dbEvents = await fetchDatabaseEvents(userId);
      console.log(`Retrieved ${dbEvents.length} database events`);
      
      const dbEventIds = new Set(dbEvents.map(event => event.id));
      const filteredLocalEvents = localEvents.filter(event => !dbEventIds.has(event.id));
      console.log(`Found ${filteredLocalEvents.length} local events`);
      
      const combinedEvents = [...dbEvents, ...filteredLocalEvents];
      setEvents(combinedEvents);
      
      generateSuggestedSessions();
      
      return combinedEvents;
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      setEvents(localEvents);
      return localEvents;
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentUserId, localEvents, generateSuggestedSessions]);

  const createEvent = async (
    eventData: Partial<CalendarEvent>,
    allowLocalFallback: boolean = false
  ): Promise<CalendarEvent> => {
    try {
      const userId = getCurrentUserId();
      
      if (!userId) {
        if (!allowLocalFallback) {
          throw new Error('No authenticated user found');
        }
        throw new Error('No user found for database operation');
      }

      const newEvent = await createDbEvent(userId, eventData);
      
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
    const isLocalEvent = id.startsWith('local-') || localEvents.some(e => e.id === id);
    
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
      await fetchEvents();
    }
    return success;
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    const isLocalEvent = id.startsWith('local-') || localEvents.some(e => e.id === id);
    
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
    events,
    suggestedEvents,
    isLoading,
    fetchEvents,
    clearEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    acceptSuggestedEvent
  };
};
