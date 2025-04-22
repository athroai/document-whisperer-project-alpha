import React, { useState, useEffect } from 'react';
import { parseISO, startOfDay, isSameDay } from 'date-fns';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarEvent } from '@/types/calendar';
import DayPlannerHeader from './DayPlannerHeader';
import DayPlannerEvents from './DayPlannerEvents';
import StudySessionDialog from './StudySessionDialog';
import { useToast } from '@/hooks/use-toast';

interface DayPlannerViewProps {
  selectedDate: Date;
  onClose: () => void;
  events: CalendarEvent[];
  isLoading: boolean;
  onRefresh: () => void;
}

const DayPlannerView = ({
  selectedDate,
  onClose,
  events,
  isLoading,
  onRefresh
}: DayPlannerViewProps) => {
  const [dayEvents, setDayEvents] = useState<CalendarEvent[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const { deleteEvent } = useCalendarEvents();
  const { toast } = useToast();

  useEffect(() => {
    // Normalize selectedDate to start of day to ensure proper comparison
    const normalizedSelectedDate = startOfDay(selectedDate);
    
    // Filter events that match the selected day
    const filteredEvents = events.filter(event => {
      try {
        if (!event.start_time) {
          return false;
        }
        
        // Parse event date and normalize to start of day
        const eventDate = startOfDay(parseISO(event.start_time));
        return isSameDay(eventDate, normalizedSelectedDate);
      } catch (err) {
        console.error('Error parsing event date:', err, event);
        return false;
      }
    });
    
    // Sort events by start time
    filteredEvents.sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    
    setDayEvents(filteredEvents);
  }, [selectedDate, events]);

  const handleAddSession = () => {
    setIsAddingEvent(true);
  };

  const handleSessionSuccess = () => {
    onRefresh();
    setIsAddingEvent(false);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this study session?')) {
      await deleteEvent(eventId);
      onRefresh();
    }
  };

  const handleEditSession = (event: CalendarEvent) => {
    // For now, just show a toast that this feature is coming soon
    // This will be implemented when you're ready to add the edit functionality
    toast({
      title: "Coming Soon",
      description: "Edit functionality will be available soon!"
    });
  };

  const handleLaunchSession = (event: CalendarEvent) => {
    // For now, just show a toast that this feature is coming soon
    // This will be implemented when you're ready to add the launch functionality
    toast({
      title: "Coming Soon",
      description: "Launch functionality will be available soon!"
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <DayPlannerHeader selectedDate={selectedDate} onClose={onClose} />
        <div className="flex-1 overflow-auto p-4">
          <DayPlannerEvents
            events={dayEvents}
            isLoading={isLoading}
            onDelete={handleDeleteEvent}
            onAddSession={handleAddSession}
            onEditSession={handleEditSession}
            onLaunchSession={handleLaunchSession}
          />
        </div>
        
        {isAddingEvent && (
          <StudySessionDialog
            open={isAddingEvent}
            onOpenChange={(open) => setIsAddingEvent(open)}
            selectedDate={selectedDate}
            onSuccess={handleSessionSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default DayPlannerView;
