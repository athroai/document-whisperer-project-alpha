
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import BigCalendarView from '@/components/calendar/BigCalendarView';
import StudySessionLauncher from '@/components/calendar/StudySessionLauncher';
import BlockTimeButton from '@/components/calendar/BlockTimeButton';
import { useAuth } from '@/contexts/AuthContext';
import SuggestedStudySessions from '@/components/calendar/SuggestedStudySessions';
import { useLocation } from 'react-router-dom';

const CalendarPage: React.FC = () => {
  const { toast } = useToast();
  const { fetchEvents, clearEvents, events } = useCalendarEvents();
  const { state: authState } = useAuth();
  const location = useLocation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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
      
      // Force refresh events when coming from onboarding
      if (authState.user?.id) {
        setIsRefreshing(true);
        fetchEvents()
          .then(() => {
            console.log("Successfully refreshed calendar events after onboarding");
            setIsRefreshing(false);
          })
          .catch(err => {
            console.error("Error refreshing events after onboarding:", err);
            setIsRefreshing(false);
          });
      }
      
      // Clean up the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search, toast, fetchEvents, authState.user]);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadCalendarEvents = async () => {
      try {
        // Only fetch events if a user is logged in
        if (authState.user?.id) {
          console.log("Fetching calendar events for user:", authState.user.id);
          await fetchEvents();
          
          if (isMounted && isInitialLoad) {
            console.log("Calendar events loaded:", events.length);
            setIsInitialLoad(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching calendar events:', err);
        }
      }
    };
    
    loadCalendarEvents();
    
    // Clear events when component unmounts
    return () => {
      isMounted = false;
      clearEvents();
    };
  }, [authState.user, fetchEvents, clearEvents, isInitialLoad, events.length]); 
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Study Calendar</h1>
          <div className="flex space-x-2">
            <BlockTimeButton />
          </div>
        </div>
        
        {isRefreshing && (
          <div className="mb-4 text-center text-gray-500">
            Loading your study schedule...
          </div>
        )}
        
        <SuggestedStudySessions />
        <BigCalendarView key={`calendar-${events.length}`} />
        <StudySessionLauncher />
      </div>
    </div>
  );
};

export default CalendarPage;
