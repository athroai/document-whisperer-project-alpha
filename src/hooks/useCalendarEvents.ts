import { useState, useCallback, useRef, useEffect } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalCalendarEvents } from './calendar/useLocalCalendarEvents';
import { useDbCalendarEvents } from './calendar/useDbCalendarEvents';
import { fetchDatabaseEvents } from '@/services/calendarEventService';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const { toast } = useToast();
  const { state: authState } = useAuth();
  const isFetchingRef = useRef(false);
  const userId = authState.user?.id;
  
  const {
    localEvents,
    addLocalEvent,
    updateLocalEvent,
    deleteLocalEvent,
    clearLocalEvents
  } = useLocalCalendarEvents();
  
  const {
    createDbEvent,
    updateDbEvent,
    deleteDbEvent
  } = useDbCalendarEvents();

  const clearEvents = useCallback(() => {
    setEvents([]);
    clearLocalEvents();
    localStorage.removeItem('cached_calendar_events');
  }, [clearLocalEvents]);

  const fetchEvents = useCallback(async () => {
    if (isFetchingRef.current) {
      console.log('Already fetching events, skipping duplicate request');
      return events;
    }
    
    if (!userId) {
      console.log('No authenticated user, returning empty events array');
      setEvents([]);
      return [];
    }
    
    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      
      console.log(`Fetching calendar events for user ${userId}`);
      const dbEvents = await fetchDatabaseEvents(userId);
      
      // Cache fetched events
      const now = Date.now();
      if (dbEvents.length > 0) {
        localStorage.setItem('cached_calendar_events', JSON.stringify({
          userId,
          events: dbEvents,
          timestamp: now
        }));
      }
      
      // Add mock events for testing if no events are returned
      let finalEvents = dbEvents;
      if (dbEvents.length === 0 && process.env.NODE_ENV === 'development') {
        console.log('No events found in database, adding mock events for testing');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        finalEvents = [
          {
            id: 'mock-1',
            title: 'Mathematics Study Session',
            subject: 'Mathematics',
            topic: 'Algebra',
            start_time: today.toISOString(),
            end_time: new Date(today.getTime() + 60 * 60 * 1000).toISOString(),
            event_type: 'study_session',
            local_only: true
          },
          {
            id: 'mock-2',
            title: 'English Literature Review',
            subject: 'English',
            topic: 'Shakespeare',
            start_time: tomorrow.toISOString(),
            end_time: new Date(tomorrow.getTime() + 90 * 60 * 1000).toISOString(),
            event_type: 'study_session',
            local_only: true
          }
        ];
      }
      
      // Filter out local events that might duplicate DB events
      const dbEventIds = new Set(dbEvents.map(event => event.id));
      const filteredLocalEvents = localEvents.filter(event => !dbEventIds.has(event.id));
      
      const combinedEvents = [...finalEvents, ...filteredLocalEvents];
      setEvents(combinedEvents);
      setLastRefreshedAt(new Date());
      
      return combinedEvents;
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      setEvents(localEvents);
      return localEvents;
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [userId, localEvents]);

  useEffect(() => {
    let mounted = true;
    
    const loadInitialEvents = async () => {
      if (!userId || lastRefreshedAt) {
        return;
      }
      
      try {
        const fetchedEvents = await fetchEvents();
        
        if (mounted) {
          setLastRefreshedAt(new Date());
          console.log(`Loaded ${fetchedEvents.length} events on initial fetch`);
        }
      } catch (error) {
        console.error('Error loading initial events:', error);
      }
    };
    
    loadInitialEvents();
    
    return () => {
      mounted = false;
    };
  }, [userId, fetchEvents, lastRefreshedAt]);

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
      setEvents(prevEvents => 
        prevEvents.map(event => event.id === id ? { ...event, ...updates } : event)
      );
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
    isLoading,
    fetchEvents,
    clearEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    lastRefreshedAt
  };
};
