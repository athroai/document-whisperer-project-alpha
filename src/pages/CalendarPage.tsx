
import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import BigCalendarView from '@/components/calendar/BigCalendarView';
import BlockTimeButton from '@/components/calendar/BlockTimeButton';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CalendarPage: React.FC = () => {
  const { toast } = useToast();
  const { fetchEvents, clearEvents, events, isLoading } = useCalendarEvents();
  const { state: authState } = useAuth();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Check if we're coming from onboarding
  const fromSetup = searchParams.get('fromSetup') === 'true';
  const shouldRefresh = searchParams.get('refresh') === 'true';

  // Only run once on initial mount to check authentication
  useEffect(() => {
    if (authState.isLoading) {
      return; // Wait for auth to finish loading
    }
    
    // Check authentication
    if (!authState.user) {
      console.log('No authenticated user, redirecting to login');
      navigate('/login');
    }
  }, [authState.isLoading, authState.user, navigate]);
  
  // Handle refreshing calendar events when needed
  useEffect(() => {
    let isMounted = true;
    
    const loadCalendarEvents = async () => {
      if (!authState.user?.id || authState.isLoading) {
        console.log("No authenticated user or still loading auth, skipping calendar load");
        if (isMounted) {
          setIsInitialLoad(false);
        }
        return;
      }
      
      try {
        console.log(`Loading calendar events for user: ${authState.user.id}`);
        const fetchedEvents = await fetchEvents();
        
        if (isMounted) {
          console.log(`Calendar events loaded: ${fetchedEvents.length} events found`);
          setIsInitialLoad(false);
          
          // Only show toast for refresh trigger or when coming from setup
          if ((refreshTrigger > 0 || fromSetup) && fetchedEvents.length > 0) {
            toast({
              title: fromSetup ? "Calendar Setup Complete" : "Calendar Updated",
              description: `Loaded ${fetchedEvents.length} study sessions.`
            });
          }
        }
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        if (isMounted) {
          setIsInitialLoad(false);
          toast({
            title: "Calendar Error",
            description: "Could not load your calendar events. Please try again.",
            variant: "destructive"
          });
        }
      }
    };
    
    // Only load events when coming from setup, when refresh is triggered, or on initial auth
    if (authState.user?.id && (fromSetup || shouldRefresh || refreshTrigger > 0)) {
      loadCalendarEvents();
    }
    
    return () => {
      isMounted = false;
    };
  }, [authState.user?.id, authState.isLoading, fetchEvents, toast, refreshTrigger, fromSetup, shouldRefresh]);
  
  const handleRetryLoad = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    clearEvents();
    toast({
      title: "Refreshing calendar",
      description: "Attempting to reload your calendar events..."
    });
  }, [clearEvents, toast]);
  
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
