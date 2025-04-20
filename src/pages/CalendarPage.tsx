
import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import BigCalendarView from '@/components/calendar/BigCalendarView';
import BlockTimeButton from '@/components/calendar/BlockTimeButton';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CalendarPage: React.FC = () => {
  const { toast } = useToast();
  const { fetchEvents, clearEvents, events, isLoading } = useCalendarEvents();
  const { state: authState } = useAuth();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check authentication
    if (!authState.user && !authState.isLoading) {
      console.log('No authenticated user, redirecting to login');
      navigate('/login');
      return;
    }
  }, [authState.user, authState.isLoading, navigate]);

  // Debug function to inspect calendar state
  const debugCalendarState = useCallback(() => {
    console.group('Calendar Debug Information');
    console.log('Authentication state:', { 
      isLoggedIn: !!authState.user, 
      userId: authState.user?.id,
      isLoading: authState.isLoading 
    });
    console.log('Events array:', events);
    console.log('Initial load status:', isInitialLoad);
    console.log('Events loading status:', isLoading);
    console.log('Fetch attempted:', fetchAttempted);
    console.groupEnd();
  }, [authState.user, authState.isLoading, events, isInitialLoad, isLoading, fetchAttempted]);
  
  useEffect(() => {
    debugCalendarState();
  }, [debugCalendarState, events]);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadCalendarEvents = async () => {
      if (!authState.user?.id) {
        console.log("No authenticated user, skipping calendar load");
        if (isMounted) {
          setIsInitialLoad(false);
          setFetchAttempted(true);
        }
        return;
      }
      
      try {
        console.log(`Loading calendar events for user: ${authState.user.id}`);
        const fetchedEvents = await fetchEvents();
        
        if (isMounted) {
          console.log(`Calendar events loaded: ${fetchedEvents.length} events found`);
          setIsInitialLoad(false);
          setFetchAttempted(true);
          
          if (fetchedEvents.length > 0) {
            toast({
              title: "Calendar Updated",
              description: `Loaded ${fetchedEvents.length} calendar events.`
            });
          }
        }
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        if (isMounted) {
          setIsInitialLoad(false);
          setFetchAttempted(true);
          toast({
            title: "Calendar Error",
            description: "Could not load your calendar events. Please try again.",
            variant: "destructive"
          });
        }
      }
    };
    
    // Force fetch events after a brief delay
    if (authState.user?.id) {
      const timer = setTimeout(() => {
        loadCalendarEvents();
      }, 500); // Small delay to ensure auth state is stable
      
      return () => {
        clearTimeout(timer);
        isMounted = false;
      };
    }
    
    return () => {
      isMounted = false;
    };
  }, [authState.user?.id, fetchEvents, toast, refreshTrigger]);
  
  const handleRetryLoad = () => {
    setFetchAttempted(false);
    setRefreshTrigger(prev => prev + 1);
    clearEvents();
    toast({
      title: "Refreshing calendar",
      description: "Attempting to reload your calendar events..."
    });
  };
  
  // Show loading state if we're still checking auth
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }
  
  // Show login redirect if no user
  if (!authState.user) {
    return null; // useEffect will handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Study Calendar</h1>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetryLoad}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            <BlockTimeButton />
          </div>
        </div>
        
        {isLoading && isInitialLoad ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-8">
              <Loader className="h-8 w-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading your study calendar...</span>
            </div>
            <Skeleton className="h-[600px] w-full rounded-md" />
          </div>
        ) : (
          <>
            <BigCalendarView 
              key={`calendar-${refreshTrigger}`}
              onRetryLoad={handleRetryLoad}
            />
            {events.length === 0 && !isLoading && (
              <div className="mt-6 text-center p-8 bg-white rounded-lg shadow border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">No calendar events found</h2>
                <p className="text-gray-500 mb-4">
                  It looks like you don't have any study sessions scheduled yet. 
                  Try refreshing or click a date on the calendar to add a new study session.
                </p>
                <Button onClick={handleRetryLoad}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Calendar
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
