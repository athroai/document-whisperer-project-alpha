
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import BigCalendarView from '@/components/calendar/BigCalendarView';
import StudySessionLauncher from '@/components/calendar/StudySessionLauncher';

const CalendarPage: React.FC = () => {
  const { toast } = useToast();
  const { fetchEvents } = useCalendarEvents();
  
  useEffect(() => {
    // Check if we're coming from a completed study schedule setup
    const urlParams = new URLSearchParams(window.location.search);
    const fromSetup = urlParams.get('fromSetup');
    
    if (fromSetup === 'true') {
      toast({
        title: "Study Schedule Created",
        description: "Your personalized study schedule has been created and is ready to use.",
      });
      
      // Refresh events to ensure we have the latest data
      fetchEvents();
      
      // Clean up the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, fetchEvents]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <BigCalendarView />
        <StudySessionLauncher />
      </div>
    </div>
  );
};

export default CalendarPage;
