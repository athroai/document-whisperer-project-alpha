
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

  // Clear all but completed events
  const clearAllEventsExceptCompleted = useCallback(async () => {
    setIsLoading(true);
    try {
      const nonCompleted = events.filter(
        (event: any) => !event.status || event.status !== 'completed'
      );
      const completed = events.filter(
        (event: any) => event.status && event.status === 'completed'
      );
      // Remove from backend/local only non-completed events
      for (const event of nonCompleted) {
        if (!event.status || event.status !== 'completed') {
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

  // New: mark event as complete/incomplete (update status)
  const markEventComplete = useCallback(
    async (eventId: string, completed: boolean) => {
      const event = events.find(e => e.id === eventId);
      if (!event) return;
      await updateEvent(eventId, { status: completed ? 'completed' : undefined });
      setEvents((prev) =>
        prev.map(ev =>
          ev.id === eventId ? { ...ev, status: completed ? 'completed' : undefined } : ev
        )
      );
      toast({
        title: completed ? "Session Marked as Complete" : "Session Marked as Incomplete",
        description: completed
          ? "Nice job! This study session has been marked as completed."
          : "Session is set as incomplete again."
      });
    },
    [events, updateEvent, setEvents, toast]
  );

  return {
    events,
    isLoading,
    fetchEvents,
    clearEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    lastRefreshedAt,
    clearAllEventsExceptCompleted,
    markEventComplete
  };
};
