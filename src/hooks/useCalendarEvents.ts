
import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalCalendarEvents } from './calendar/useLocalCalendarEvents';
import { useEventsState } from './calendar/useEventsState';
import { useEventFetching } from './calendar/useEventFetching';
import { useEventOperations } from './calendar/useEventOperations';

export const useCalendarEvents = () => {
  const { state: authState } = useAuth();
  const userId = authState.user?.id;
  const initialFetchDone = useRef(false);
  const initialFetchInProgress = useRef(false);
  const fetchCooldown = useRef(false);
  
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
  
  const { fetchEvents: fetchEventsFromService } = useEventFetching(
    userId,
    setEvents,
    setIsLoading,
    setLastRefreshedAt,
    localEvents
  );

  // Create a stabilized fetchEvents function with cooldown protection
  const fetchEvents = useCallback(async () => {
    // If in cooldown period, return cached events
    if (fetchCooldown.current) {
      console.log('Fetch in cooldown period, returning cached events');
      return events;
    }
    
    // Set cooldown to prevent rapid repeated calls
    fetchCooldown.current = true;
    
    try {
      const result = await fetchEventsFromService();
      return result;
    } finally {
      // Release the cooldown after a delay
      setTimeout(() => {
        fetchCooldown.current = false;
      }, 2000);
    }
  }, [events, fetchEventsFromService]);
  
  const {
    createEvent,
    updateEvent,
    deleteEvent
  } = useEventOperations(events, setEvents);

  // Optimize the initial load effect to prevent unnecessary re-fetches
  useEffect(() => {
    let mounted = true;
    
    const loadInitialEvents = async () => {
      // Prevent multiple simultaneous initial loads
      if (!userId || initialFetchDone.current || initialFetchInProgress.current) {
        return;
      }
      
      try {
        initialFetchInProgress.current = true;
        console.log('Initial calendar events fetch starting...');
        const fetchedEvents = await fetchEvents();
        
        if (mounted) {
          initialFetchDone.current = true;
          setLastRefreshedAt(new Date());
          console.log(`Loaded ${fetchedEvents.length} events on initial fetch`);
        }
      } catch (error) {
        console.error('Error loading initial events:', error);
      } finally {
        if (mounted) {
          initialFetchInProgress.current = false;
        }
      }
    };
    
    // Only attempt to load events if we have a userId and haven't already loaded
    if (userId && !initialFetchDone.current && !initialFetchInProgress.current) {
      loadInitialEvents();
    }
    
    return () => {
      mounted = false;
    };
  }, [userId, fetchEvents, setLastRefreshedAt]);

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
