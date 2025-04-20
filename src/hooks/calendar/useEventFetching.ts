
import { useCallback, useRef } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { fetchDatabaseEvents } from '@/services/calendarEventService';
import { useToast } from '@/hooks/use-toast';

export const useEventFetching = (
  userId: string | undefined,
  setEvents: (events: CalendarEvent[]) => void,
  setIsLoading: (loading: boolean) => void,
  setLastRefreshedAt: (date: Date) => void,
  localEvents: CalendarEvent[]
) => {
  const isFetchingRef = useRef(false);
  const { toast } = useToast();

  const fetchEvents = useCallback(async () => {
    if (isFetchingRef.current) {
      console.log('Already fetching events, skipping duplicate request');
      return localEvents;
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
      
      // Log the fetched events
      console.log(`Fetched ${dbEvents.length} events from database:`, dbEvents);
      
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
      console.log(`Setting ${combinedEvents.length} combined events`);
      setEvents(combinedEvents);
      setLastRefreshedAt(new Date());
      
      return combinedEvents;
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      toast({
        title: "Error loading events",
        description: "Could not load your calendar events. Please try refreshing.",
        variant: "destructive"
      });
      setEvents(localEvents);
      return localEvents;
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [userId, localEvents, setEvents, setIsLoading, setLastRefreshedAt, toast]);

  return { fetchEvents };
};
