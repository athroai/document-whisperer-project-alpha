
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import BigCalendarView from '@/components/calendar/BigCalendarView';
import StudySessionLauncher from '@/components/calendar/StudySessionLauncher';
import BlockTimeButton from '@/components/calendar/BlockTimeButton';
import { useAuth } from '@/contexts/AuthContext';
import SuggestedStudySessions from '@/components/calendar/SuggestedStudySessions';
import { useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const CalendarPage: React.FC = () => {
  const { toast } = useToast();
  const { fetchEvents, clearEvents, events, isLoading } = useCalendarEvents();
  const { state: authState } = useAuth();
  const location = useLocation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  
  // Check if we're coming from onboarding
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const fromSetup = urlParams.get('fromSetup');
    
    if (fromSetup === 'true') {
      console.log("Detected calendar view after onboarding completion");
      toast({
        title: "Study Schedule Created",
        description: "Your personalized study schedule has been created and is ready to use.",
      });
      
      // Clean up the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search, toast]);
  
  // Load calendar events only once when the component mounts or auth state changes
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
        console.log("Loading calendar events for user:", authState.user.id);
        await fetchEvents();
        
        if (isMounted) {
          console.log("Calendar events loaded successfully");
          setIsInitialLoad(false);
          setFetchAttempted(true);
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
    
    if (authState.user?.id && !fetchAttempted) {
      loadCalendarEvents();
    } else if (!authState.user?.id) {
      setIsInitialLoad(false);
      setFetchAttempted(true);
    }
    
    return () => {
      isMounted = false;
    };
  }, [authState.user?.id, fetchEvents, toast, fetchAttempted, refreshTrigger]);
  
  const handleRetryLoad = () => {
    setFetchAttempted(false);
    setRefreshTrigger(prev => prev + 1);
    clearEvents();
    toast({
      title: "Refreshing calendar",
      description: "Attempting to reload your calendar events..."
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Study Calendar</h1>
          <div className="flex space-x-2">
            <BlockTimeButton />
          </div>
        </div>
        
        <SuggestedStudySessions />
        
        {isLoading && isInitialLoad ? (
          <div className="space-y-4">
            <Skeleton className="h-[600px] w-full rounded-md" />
          </div>
        ) : (
          <BigCalendarView 
            key={`calendar-${refreshTrigger}`}
            onRetryLoad={handleRetryLoad}
          />
        )}
        
        <StudySessionLauncher />
      </div>
    </div>
  );
};

export default CalendarPage;
