
import { useCallback, useRef } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { fetchDatabaseEvents } from '@/services/calendarEventService';

export const useEventFetching = (
  userId: string | undefined,
  setEvents: (events: CalendarEvent[]) => void,
  setIsLoading: (loading: boolean) => void,
  setLastRefreshedAt: (date: Date) => void,
  localEvents: CalendarEvent[]
) => {
  const isFetchingRef = useRef(false);

  const fetchEvents = useCallback(async () => {
    if (isFetchingRef.current) {
      console.log('Already fetching events, skipping duplicate request');
      return localEvents; // Return local events instead of undefined 'events'
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
  }, [userId, localEvents, setEvents, setIsLoading, setLastRefreshedAt]);

  return { fetchEvents };
};
