import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import BigCalendarView from '@/components/calendar/BigCalendarView';
import StudySessionLauncher from '@/components/calendar/StudySessionLauncher';
import BlockTimeButton from '@/components/calendar/BlockTimeButton';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CalendarPage: React.FC = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { fetchEvents, clearEvents, events, isLoading } = useCalendarEvents();
  const { state: authState } = useAuth();
  const location = useLocation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    const fromSetup = searchParams.get('fromSetup');
    const shouldRefresh = searchParams.get('refresh');
    
    if (fromSetup === 'true') {
      console.log("Detected calendar view after onboarding completion");
      toast({
        title: "Study Schedule Created",
        description: "Your personalized study schedule has been created and is ready to use.",
      });
      
      window.history.replaceState({}, document.title, window.location.pathname);
      
      if (shouldRefresh === 'true') {
        console.log("Refresh flag detected, forcing calendar reload");
        setRefreshTrigger(prev => prev + 1);
        setFetchAttempted(false);
      }
    }
  }, [searchParams, toast]);
  
  useEffect(() => {
    let isMounted = true;
    let retryTimeout: number | null = null;
    
    const loadCalendarEvents = async () => {
      if (!authState.user?.id) {
        console.log("No authenticated user, skipping calendar load");
        if (isMounted) {
          setIsInitialLoad(false);
          setFetchAttempted(true);
          setLoadingStatus('idle');
        }
        return;
      }
      
      try {
        console.log(`Loading calendar events for user: ${authState.user.id} (attempt ${retryCount + 1})`);
        setLoadingStatus('loading');
        
        const fetchedEvents = await fetchEvents();
        
        if (isMounted) {
          console.log(`Calendar events loaded: ${fetchedEvents.length} events found`);
          
          if (fetchedEvents.length === 0 && retryCount < 3) {
            console.log(`No events found, will retry (${retryCount + 1}/3)`);
            setRetryCount(prev => prev + 1);
            
            retryTimeout = window.setTimeout(() => {
              setRefreshTrigger(prev => prev + 1);
              setFetchAttempted(false);
            }, 1000 * (retryCount + 1));
            
            setLoadingStatus('idle');
          } else {
            setIsInitialLoad(false);
            setFetchAttempted(true);
            setLoadingStatus('success');
            
            if (fetchedEvents.length > 0) {
              toast({
                title: "Calendar Updated",
                description: `Loaded ${fetchedEvents.length} calendar events.`
              });
            }
          }
        }
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        if (isMounted) {
          setIsInitialLoad(false);
          setFetchAttempted(true);
          setLoadingStatus('error');
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
      setLoadingStatus('idle');
    }
    
    return () => {
      isMounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [authState.user?.id, fetchEvents, toast, fetchAttempted, refreshTrigger, retryCount]);
  
  const handleRetryLoad = () => {
    setFetchAttempted(false);
    setRefreshTrigger(prev => prev + 1);
    setRetryCount(0);
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetryLoad}
              disabled={loadingStatus === 'loading'}
            >
              {loadingStatus === 'loading' ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            <BlockTimeButton />
          </div>
        </div>
        
        {loadingStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            Failed to load calendar events. Please try refreshing the calendar.
          </div>
        )}
        
        <SuggestedStudySessions />
        
        {isLoading && isInitialLoad ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-8">
              <Loader className="h-8 w-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading your study calendar...</span>
            </div>
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
