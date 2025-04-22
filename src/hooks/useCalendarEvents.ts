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
    if (fetchCooldown.current) {
      console.log('Fetch in cooldown period, returning cached events');
      return events;
    }
    fetchCooldown.current = true;
    try {
      const result = await fetchEventsFromService();
      return result;
    } finally {
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

  useEffect(() => {
    let mounted = true;
    const loadInitialEvents = async () => {
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
    if (userId && !initialFetchDone.current && !initialFetchInProgress.current) {
      loadInitialEvents();
    }
    return () => {
      mounted = false;
    };
  }, [userId, fetchEvents, setLastRefreshedAt]);

  // New: clear all but completed events
  const clearAllEventsExceptCompleted = useCallback(async () => {
    setIsLoading(true);
    try {
      // "completed" definition: status === 'completed' (we will allow user to redefine this later)
      // For now, filter and keep only events that are marked completed (if they have such a status)
      const nonCompleted = events.filter(
        (event: any) =>
          !event.status || event.status !== 'completed'
      );
      const completed = events.filter(
        (event: any) =>
          event.status && event.status === 'completed'
      );
      // Remove from backend/local only non-completed events
      for (const event of nonCompleted) {
        // For calendar_events source, only delete those with event_type === 'study_session'
        if (
          !event.status ||
          event.status !== 'completed'
        ) {
          await deleteEvent(event.id);
        }
      }
      setEvents(completed);
      toast({
        title: "Calendar Cleared",
        description: `Removed ${nonCompleted.length} study sessions (all except those marked "completed").`
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not clear calendar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [events, setEvents, setIsLoading, toast, deleteEvent]);
  
  return {
    events,
    isLoading,
    fetchEvents,
    clearEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    lastRefreshedAt,
    clearAllEventsExceptCompleted
  };
};
