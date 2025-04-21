
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
  const fetchAttempted = useRef(false);
  
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
        
        setIsLoading(false);
        fetchAttempted.current = true;
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
        setIsLoading(false);
        fetchAttempted.current = true;
        return combinedEvents;
      } catch (fetchError) {
        console.error('Error fetching database events:', fetchError);
        
        // Fall back to local events if database fetch fails
        if (localEvents.length > 0) {
          setEvents(localEvents);
        } else {
          setEvents([]);
        }
        
        setIsLoading(false);
        fetchAttempted.current = true;
        return localEvents;
      }
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      setIsLoading(false);
      fetchAttempted.current = true;
      return [];
    } finally {
      fetchInProgress.current = false;
    }
  }, [userId, setEvents, setIsLoading, localEvents]);

  // Set up real-time subscription for calendar events
  useEffect(() => {
    if (!userId || subscriptionActive.current) return;
    
    let subscription: any;
    
    const setupSubscription = () => {
      subscriptionActive.current = true;
      console.log('Setting up real-time subscription for calendar events');
      
      subscription = supabase
        .channel('calendar-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'calendar_events' },
          (payload) => {
            console.log('Received real-time update for calendar_events:', payload);
            
            // Only fetch if we've completed at least one initial fetch
            if (fetchAttempted.current) {
              setTimeout(async () => {
                try {
                  await fetchEvents();
                  setLastRefreshedAt(new Date());
                  console.log(`Refreshed calendar events after real-time update`);
                } catch (error) {
                  console.error('Error refreshing events after real-time update:', error);
                }
              }, 1000); // Debounce for 1 second
            }
          }
        )
        .subscribe();
    };
    
    // Only setup subscription if userId exists
    if (userId) {
      setupSubscription();
    }
      
    return () => {
      if (subscription) {
        console.log('Cleaning up real-time subscription');
        subscriptionActive.current = false;
        supabase.removeChannel(subscription);
      }
    };
  }, [userId, fetchEvents, setLastRefreshedAt]);

  return { fetchEvents };
};
