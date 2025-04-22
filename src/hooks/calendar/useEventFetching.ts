import { useEffect, useCallback, useRef } from 'react';
import { fetchDatabaseEvents } from '@/services/calendar/calendarEventService';
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
  const realtimeUpdateDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTime = useRef<number>(0);
  
  const fetchEvents = useCallback(async (): Promise<CalendarEvent[]> => {
    const now = Date.now();
    if (fetchInProgress.current) {
      console.log('Fetch already in progress, skipping');
      return [];
    }
    
    if ((now - lastFetchTime.current) < 2000 && fetchAttempted.current) {
      console.log('Fetch attempted too recently, skipping');
      return [];
    }
    
    try {
      fetchInProgress.current = true;
      setIsLoading(true);
      lastFetchTime.current = now;
      
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
        
        const localOnlyEvents = localEvents.filter(e => e.local_only);
        const combinedEvents = [...dbEvents, ...localOnlyEvents];
        
        console.log(`Fetched ${dbEvents.length} database events and ${localOnlyEvents.length} local-only events`);
        setEvents(combinedEvents);
        setIsLoading(false);
        fetchAttempted.current = true;
        return combinedEvents;
      } catch (fetchError) {
        console.error('Error fetching database events:', fetchError);
        
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
      setTimeout(() => {
        fetchInProgress.current = false;
      }, 1000);
    }
  }, [userId, setEvents, setIsLoading, localEvents]);

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
            
            if (fetchAttempted.current) {
              if (realtimeUpdateDebounceTimer.current) {
                clearTimeout(realtimeUpdateDebounceTimer.current);
              }
              
              realtimeUpdateDebounceTimer.current = setTimeout(async () => {
                try {
                  if (!fetchInProgress.current) {
                    const now = Date.now();
                    if ((now - lastFetchTime.current) >= 3000) {
                      await fetchEvents();
                      setLastRefreshedAt(new Date());
                      console.log(`Refreshed calendar events after real-time update`);
                    } else {
                      console.log('Skipping refresh, too soon after last fetch');
                    }
                  }
                } catch (error) {
                  console.error('Error refreshing events after real-time update:', error);
                }
              }, 5000);
            }
          }
        )
        .subscribe();
    };
    
    if (userId) {
      setupSubscription();
    }
      
    return () => {
      console.log('Cleaning up real-time subscription');
      subscriptionActive.current = false;
      
      if (subscription) {
        supabase.removeChannel(subscription);
      }
      
      if (realtimeUpdateDebounceTimer.current) {
        clearTimeout(realtimeUpdateDebounceTimer.current);
      }
    };
  }, [userId, fetchEvents, setLastRefreshedAt]);

  return { fetchEvents };
};
