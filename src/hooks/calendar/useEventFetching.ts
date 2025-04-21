
import { useEffect, useCallback, useRef } from 'react';
import { fetchDatabaseEvents } from '@/services/calendarEventService';
import { CalendarEvent } from '@/types/calendar';
import { supabase } from '@/lib/supabase';

export const useEventFetching = (
  userId: string | undefined,
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setLastRefreshedAt: React.Dispatch<React.SetStateAction<Date | null>>,
  localEvents: CalendarEvent[]
) => {
  const fetchInProgress = useRef(false);
  const subscriptionActive = useRef(false);
  
  // Fetch events from the database and local storage
  const fetchEvents = useCallback(async (): Promise<CalendarEvent[]> => {
    // Prevent multiple concurrent fetches
    if (fetchInProgress.current) {
      console.log('Fetch already in progress, skipping');
      return [];
    }
    
    try {
      fetchInProgress.current = true;
      setIsLoading(true);
      
      // Verify authentication or get authenticated user ID
      let authenticatedId = userId;
      if (!authenticatedId) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          authenticatedId = session?.user?.id;
          console.log('Using authenticated user ID:', authenticatedId);
        } catch (err) {
          console.error('Auth verification failed:', err);
        }
      }

      // If still no authenticated ID, use local events only
      if (!authenticatedId) {
        console.log('No authenticated user ID found, using only local events');
        
        if (localEvents.length > 0) {
          console.log(`Loading ${localEvents.length} local events`);
          setEvents(localEvents);
        } else {
          setEvents([]);
        }
        
        return localEvents;
      }
      
      try {
        console.log(`Fetching database events for user: ${authenticatedId}`);
        const dbEvents = await fetchDatabaseEvents(authenticatedId);
        
        // Combine with local events, ensuring no duplicates
        const localOnlyEvents = localEvents.filter(e => e.local_only);
        const combinedEvents = [...dbEvents, ...localOnlyEvents];
        
        console.log(`Fetched ${dbEvents.length} database events and ${localOnlyEvents.length} local-only events`);
        setEvents(combinedEvents);
        return combinedEvents;
      } catch (fetchError) {
        console.error('Error fetching database events:', fetchError);
        
        // Fall back to local events if database fetch fails
        if (localEvents.length > 0) {
          setEvents(localEvents);
        } else {
          setEvents([]);
        }
        
        return localEvents;
      }
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      return [];
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [userId, setEvents, setIsLoading, localEvents]);

  // Set up real-time subscription for calendar events
  useEffect(() => {
    if (!userId || subscriptionActive.current) return;
    
    subscriptionActive.current = true;
    console.log('Setting up real-time subscription for calendar events');
    
    const subscription = supabase
      .channel('calendar-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'calendar_events' },
        (payload) => {
          console.log('Received real-time update for calendar_events:', payload);
          
          // Use a debounce mechanism for real-time updates
          const debounceDelay = setTimeout(async () => {
            try {
              await fetchEvents();
              setLastRefreshedAt(new Date());
              console.log(`Refreshed calendar events after real-time update`);
            } catch (error) {
              console.error('Error refreshing events after real-time update:', error);
            }
          }, 1000); // Debounce for 1 second
          
          return () => clearTimeout(debounceDelay);
        }
      )
      .subscribe();
      
    return () => {
      console.log('Cleaning up real-time subscription');
      subscriptionActive.current = false;
      supabase.removeChannel(subscription);
    };
  }, [userId, fetchEvents, setLastRefreshedAt]);

  return { fetchEvents };
};
