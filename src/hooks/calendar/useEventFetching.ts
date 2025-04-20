
import { useCallback } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { fetchDatabaseEvents } from '@/services/calendarEventService';

export const useEventFetching = (
  userId: string | undefined,
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setLastRefreshedAt: React.Dispatch<React.SetStateAction<Date | null>>,
  localEvents: CalendarEvent[]
) => {
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    
    try {
      let allEvents: CalendarEvent[] = [];
      
      // Try to fetch from database first
      if (userId) {
        const dbEvents = await fetchDatabaseEvents(userId);
        console.log(`Fetched ${dbEvents.length} events from database`);
        allEvents = [...dbEvents];
      }
      
      // Add local events if needed
      if (localEvents.length > 0) {
        console.log(`Including ${localEvents.length} local events`);
        
        // Filter out any local events that might have been saved to the database
        const uniqueLocalEvents = localEvents.filter(localEvent => {
          return !allEvents.some(dbEvent => {
            if (localEvent.id && dbEvent.id) {
              return localEvent.id === dbEvent.id;
            }
            return false;
          });
        });
        
        allEvents = [...allEvents, ...uniqueLocalEvents];
      }
      
      setEvents(allEvents);
      return allEvents;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    } finally {
      setIsLoading(false);
      setLastRefreshedAt(new Date());
    }
  }, [userId, localEvents, setEvents, setIsLoading, setLastRefreshedAt]);

  return { fetchEvents };
};
