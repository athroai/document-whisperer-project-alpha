
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck';
import { Loader } from 'lucide-react';
import CalendarToolbar from '@/components/calendar/CalendarToolbar';
import CalendarLoading from '@/components/calendar/CalendarLoading';
import CalendarError from '@/components/calendar/CalendarError';
import CalendarContainer from '@/components/calendar/CalendarContainer';

const CalendarPage: React.FC = () => {
  const { toast } = useToast();
  const { fetchEvents, clearEvents, events, isLoading } = useCalendarEvents();
  const { state: authState } = useAuth();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadComplete = useRef(false);
  const calendarMountedRef = useRef(true); // Start as true since component is mounted
  const manualRefreshInProgress = useRef(false);
  const lastRefreshTime = useRef<number>(0);
  
  const fromSetup = searchParams.get('fromSetup') === 'true';
  const shouldRefresh = searchParams.get('refresh') === 'true';
  const { needsOnboarding, isLoading: checkingOnboarding, restartOnboarding } = useOnboardingCheck(false);

  // Added cooldown period to prevent rapid refreshes
  const handleRetryLoad = useCallback(() => {
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
    
    // Reset the manual refresh flag after a delay
    setTimeout(() => {
      manualRefreshInProgress.current = false;
    }, 3000);
  }, [toast]);

  // Handle restart onboarding button click
  const handleRestartOnboarding = useCallback(() => {
    // This calls the restartOnboarding function from useOnboardingCheck
    // which redirects to the onboarding page with restart flag
    if (restartOnboarding) {
      toast({
        title: "Restarting onboarding",
        description: "Taking you to the beginning of setup..."
      });
      restartOnboarding();
    }
  }, [restartOnboarding, toast]);

  // Set calendarMountedRef on mount/unmount to prevent memory leaks and extra renders
  useEffect(() => {
    calendarMountedRef.current = true;
    return () => {
      calendarMountedRef.current = false;
    };
  }, []);

  // Check authentication and handle initial load
  useEffect(() => {
    if (authState.isLoading) return;
    if (!authState.user) {
      console.log('No authenticated user, redirecting to login');
      navigate('/login');
    }
  }, [authState.isLoading, authState.user, navigate]);

  // Handle calendar events loading - optimized to prevent excessive refreshes
  useEffect(() => {
    let isMounted = true;
    
    // Avoid loading if already loaded or no user
    if (initialLoadComplete.current || !calendarMountedRef.current || !authState.user?.id) {
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
    
    // Add a small delay to prevent rapid consecutive loads
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
  }, [authState.user?.id, isInitialLoad, fetchEvents, toast, refreshTrigger, fromSetup, shouldRefresh]);

  // Handle onboarding check separately to avoid calendar reloads
  useEffect(() => {
    if (!checkingOnboarding && needsOnboarding === true && authState.user && calendarMountedRef.current) {
      toast({
        title: "Onboarding Required",
        description: "Please complete onboarding to set up your study plan."
      });
      navigate('/onboarding');
    }
  }, [needsOnboarding, checkingOnboarding, navigate, authState.user, toast]);

  if (authState.isLoading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!authState.user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <CalendarToolbar 
          isLoading={isLoading} 
          onRefresh={handleRetryLoad} 
          onRestartOnboarding={handleRestartOnboarding} 
        />
        
        {(isLoading && isInitialLoad) ? (
          <CalendarLoading />
        ) : loadError ? (
          <CalendarError error={loadError} onRetry={handleRetryLoad} />
        ) : (
          <CalendarContainer
            events={events}
            isLoading={isLoading}
            needsOnboarding={!!needsOnboarding}
            refreshTrigger={refreshTrigger}
            onRetryLoad={handleRetryLoad}
          />
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
