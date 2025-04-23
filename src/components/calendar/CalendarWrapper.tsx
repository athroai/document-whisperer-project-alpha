
import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import CalendarToolbar from './CalendarToolbar';
import CalendarLoading from './CalendarLoading';
import CalendarError from './CalendarError';
import CalendarContainer from './CalendarContainer';

interface CalendarWrapperProps {
  fromSetup?: boolean;
  shouldRefresh?: boolean;
  onRestartOnboarding: () => void;
}

const CalendarWrapper: React.FC<CalendarWrapperProps> = ({
  fromSetup = false,
  shouldRefresh = false,
  onRestartOnboarding
}) => {
  const { toast } = useToast();
  const { fetchEvents, clearEvents, events, isLoading } = useCalendarEvents();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadComplete = useRef(false);
  const calendarMountedRef = useRef(true);
  const manualRefreshInProgress = useRef(false);
  const lastRefreshTime = useRef<number>(0);

  const handleRetryLoad = React.useCallback(() => {
    const now = Date.now();
    if (manualRefreshInProgress.current || (now - lastRefreshTime.current < 3000)) {
      console.log('Refresh already in progress or too soon since last refresh');
      return;
    }
    
    manualRefreshInProgress.current = true;
    lastRefreshTime.current = now;
    
    setRefreshTrigger(prev => prev + 1);
    toast({
      title: "Refreshing calendar",
      description: "Attempting to reload your calendar events..."
    });
    
    setTimeout(() => {
      manualRefreshInProgress.current = false;
    }, 3000);
  }, [toast]);

  React.useEffect(() => {
    calendarMountedRef.current = true;
    return () => {
      calendarMountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    
    if (initialLoadComplete.current || !calendarMountedRef.current) {
      if (isMounted && isInitialLoad) setIsInitialLoad(false);
      return;
    }
    
    const loadCalendarEvents = async () => {
      setLoadError(null);
      
      try {
        if ((fromSetup || shouldRefresh) && !initialLoadComplete.current) {
          localStorage.removeItem('cached_calendar_events');
        }
        
        const fetchedEvents = await fetchEvents();
        
        if (isMounted && calendarMountedRef.current) {
          initialLoadComplete.current = true;
          setIsInitialLoad(false);
          
          if ((refreshTrigger > 0 || fromSetup) && fetchedEvents.length > 0) {
            toast({
              title: fromSetup ? "Calendar Setup Complete" : "Calendar Updated",
              description: `Loaded ${fetchedEvents.length} study sessions.`
            });
          }
        }
      } catch (err: any) {
        console.error('Error fetching calendar events:', err);
        if (isMounted && calendarMountedRef.current) {
          setIsInitialLoad(false);
          setLoadError(err.message || "Could not load calendar events");
          toast({
            title: "Calendar Error",
            description: "Could not load your calendar events. Please try again.",
            variant: "destructive"
          });
        }
      } finally {
        if (isMounted) {
          manualRefreshInProgress.current = false;
        }
      }
    };
    
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    refreshTimeoutRef.current = setTimeout(() => {
      loadCalendarEvents();
      refreshTimeoutRef.current = null;
    }, 300);
    
    return () => {
      isMounted = false;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchEvents, toast, refreshTrigger, fromSetup, shouldRefresh, isInitialLoad]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <CalendarToolbar 
        isLoading={isLoading} 
        onRefresh={handleRetryLoad} 
        onRestartOnboarding={onRestartOnboarding} 
      />
      
      {(isLoading && isInitialLoad) ? (
        <CalendarLoading />
      ) : loadError ? (
        <CalendarError error={loadError} onRetry={handleRetryLoad} />
      ) : (
        <CalendarContainer
          events={events}
          isLoading={isLoading}
          needsOnboarding={false}
          refreshTrigger={refreshTrigger}
          onRetryLoad={handleRetryLoad}
        />
      )}
    </div>
  );
};

export default CalendarWrapper;
