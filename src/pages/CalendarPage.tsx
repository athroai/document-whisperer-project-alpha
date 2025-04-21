
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
  const calendarMountedRef = useRef(false);
  
  const fromSetup = searchParams.get('fromSetup') === 'true';
  const shouldRefresh = searchParams.get('refresh') === 'true';
  const { needsOnboarding, isLoading: checkingOnboarding } = useOnboardingCheck(false);

  const handleRetryLoad = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    clearEvents();
    initialLoadComplete.current = false;
    localStorage.removeItem('cached_calendar_events');
    toast({
      title: "Refreshing calendar",
      description: "Attempting to reload your calendar events..."
    });
  }, [clearEvents, toast]);

  // Check authentication and handle initial load
  useEffect(() => {
    if (authState.isLoading) return;
    if (!authState.user) {
      console.log('No authenticated user, redirecting to login');
      navigate('/login');
    }
    
    calendarMountedRef.current = true;
    
    return () => {
      calendarMountedRef.current = false;
    };
  }, [authState.isLoading, authState.user, navigate]);

  // Handle calendar events loading
  useEffect(() => {
    let isMounted = true;
    
    const loadCalendarEvents = async () => {
      if (!authState.user?.id || authState.isLoading || initialLoadComplete.current || !calendarMountedRef.current) {
        if (isMounted && !initialLoadComplete.current && !authState.isLoading) setIsInitialLoad(false);
        return;
      }
      
      setLoadError(null);
      
      try {
        if (fromSetup || shouldRefresh) {
          clearEvents();
          localStorage.removeItem('cached_calendar_events');
        }
        
        if (fromSetup) {
          await new Promise(resolve => setTimeout(resolve, 800));
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
      }
    };
    
    if (authState.user?.id && !authState.isLoading && (isInitialLoad || refreshTrigger > 0 || fromSetup || shouldRefresh)) {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = setTimeout(() => {
        loadCalendarEvents();
        refreshTimeoutRef.current = null;
      }, 300);
    } else if (!authState.isLoading && isInitialLoad) {
      setIsInitialLoad(false);
    }
    
    return () => {
      isMounted = false;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [authState.user?.id, authState.isLoading, fetchEvents, toast, refreshTrigger, fromSetup, shouldRefresh, clearEvents, navigate, isInitialLoad]);

  // Handle onboarding check
  useEffect(() => {
    if (!checkingOnboarding && needsOnboarding === true && authState.user) {
      toast({
        title: "Onboarding Required",
        description: "Please complete onboarding to set up your study plan."
      });
      navigate('/athro-onboarding');
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
        <CalendarToolbar isLoading={isLoading} onRefresh={handleRetryLoad} />
        
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
