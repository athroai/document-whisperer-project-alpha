
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalCalendarEvents } from './calendar/useLocalCalendarEvents';
import { useEventsState } from './calendar/useEventsState';
import { useEventFetching } from './calendar/useEventFetching';
import { useEventOperations } from './calendar/useEventOperations';

export const useCalendarEvents = () => {
  const { state: authState } = useAuth();
  const userId = authState.user?.id;
  
  const {
    events,
    setEvents,
    isLoading,
    setIsLoading,
    lastRefreshedAt,
    setLastRefreshedAt,
    clearEvents,
    toast
  } = useEventsState();
  
  const {
    localEvents,
    clearLocalEvents
  } = useLocalCalendarEvents();
  
  const { fetchEvents } = useEventFetching(
    userId,
    setEvents,
    setIsLoading,
    setLastRefreshedAt,
    localEvents
  );
  
  const {
    createEvent,
    updateEvent,
    deleteEvent
  } = useEventOperations(events, setEvents);

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
