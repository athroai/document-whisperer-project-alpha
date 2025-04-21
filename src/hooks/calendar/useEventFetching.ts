
import { useEffect, useCallback } from 'react';
import { fetchDatabaseEvents } from '@/services/calendarEventService';
import { CalendarEvent } from '@/types/calendar';
import { supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/supabase';

export const useEventFetching = (
  userId: string | undefined,
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setLastRefreshedAt: React.Dispatch<React.SetStateAction<Date | null>>,
  localEvents: CalendarEvent[]
) => {
  // Fetch events from the database and local storage
  const fetchEvents = useCallback(async (): Promise<CalendarEvent[]> => {
    try {
      setIsLoading(true);
      
      // Verify authentication or get mock user for development
      let authenticatedId = userId;
      if (!userId) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          authenticatedId = session?.user?.id;
          console.log('Using authenticated user ID:', authenticatedId);
        } catch (err) {
          console.error('Auth verification failed:', err);
        }
      }

      if (!authenticatedId) {
        console.log('No authenticated user ID found, using only local events');
        
        if (localEvents.length > 0) {
          console.log(`Loading ${localEvents.length} local events`);
          setEvents(localEvents);
          return localEvents;
        }
        
        setEvents([]);
        return [];
      }
      
      try {
        console.log(`Fetching database events for user: ${authenticatedId}`);
        const dbEvents = await fetchDatabaseEvents(authenticatedId);
        
        // Combine with local events
        const combinedEvents = [...dbEvents, ...localEvents.filter(e => e.local_only)];
        console.log(`Fetched ${dbEvents.length} database events and ${localEvents.length} local events`);
        
        setEvents(combinedEvents);
        return combinedEvents;
      } catch (fetchError) {
        console.error('Error fetching database events:', fetchError);
        
        // Fall back to local events if database fetch fails
        if (localEvents.length > 0) {
          setEvents(localEvents);
          return localEvents;
        }
        
        setEvents([]);
        return [];
      }
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [userId, setEvents, setIsLoading, localEvents]);

  // Set up real-time subscription for calendar events
  useEffect(() => {
    if (!userId) return;
    
    const subscription = supabase
      .channel('calendar-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'calendar_events' },
        async (payload) => {
          console.log('Received real-time update for calendar_events:', payload);
          
          // Refresh events when changes occur
          try {
            await fetchEvents();
            setLastRefreshedAt(new Date());
            console.log(`Refreshed calendar events after real-time update`);
          } catch (error) {
            console.error('Error refreshing events after real-time update:', error);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId, fetchEvents, setLastRefreshedAt]);

  return { fetchEvents };
};
