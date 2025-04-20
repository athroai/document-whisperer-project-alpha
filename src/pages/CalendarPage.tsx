
import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import BigCalendarView from '@/components/calendar/BigCalendarView';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader } from 'lucide-react';
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck';

import CalendarToolbar from '@/components/calendar/CalendarToolbar';
import CalendarEmptyState from '@/components/calendar/CalendarEmptyState';

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

  // Check if user needs onboarding
  const { needsOnboarding, isLoading: checkingOnboarding } = useOnboardingCheck(false);

  // Only run once on initial mount to check authentication
  useEffect(() => {
    if (authState.isLoading) return;
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
        if (isMounted) setIsInitialLoad(false);
        return;
      }
      try {
        if (fromSetup || shouldRefresh) {
          clearEvents();
          localStorage.removeItem('cached_calendar_events');
        }
        if (fromSetup) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
        const fetchedEvents = await fetchEvents();
        if (isMounted) {
          setIsInitialLoad(false);
          if ((refreshTrigger > 0 || fromSetup) && fetchedEvents.length > 0) {
            toast({
              title: fromSetup ? "Calendar Setup Complete" : "Calendar Updated",
              description: `Loaded ${fetchedEvents.length} study sessions.`
            });
          } else if ((refreshTrigger > 0 || fromSetup) && fetchedEvents.length === 0) {
            toast({
              title: "No Events Found",
              description: "No study sessions were found in your calendar.",
              variant: "default"
            });
            if (fromSetup) {
              toast({
                title: "Try Creating Sessions",
                description: "Click on a date in the calendar to create your first study session.",
                variant: "default"
              });
            }
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
    if (authState.user?.id && !authState.isLoading) {
      loadCalendarEvents();
    }
    return () => { isMounted = false; };
  }, [authState.user?.id, authState.isLoading, fetchEvents, toast, refreshTrigger, fromSetup, shouldRefresh, clearEvents]);
  
  const handleRetryLoad = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    clearEvents();
    localStorage.removeItem('cached_calendar_events');
    toast({
      title: "Refreshing calendar",
      description: "Attempting to reload your calendar events..."
    });
  }, [clearEvents, toast]);
  
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
              <CalendarEmptyState 
                needsOnboarding={!!needsOnboarding}
                onRefresh={handleRetryLoad}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
