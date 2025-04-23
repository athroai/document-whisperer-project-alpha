
import React, { useState, useEffect } from 'react';
import { parseISO, startOfDay, isSameDay } from 'date-fns';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarEvent } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';
import DayPlannerHeader from './DayPlannerHeader';
import DayPlannerEvents from './DayPlannerEvents';
import StudySessionDialog from './StudySessionDialog';

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
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const { deleteEvent } = useCalendarEvents();
  const { toast } = useToast();

  // Update the day events when the parent events array changes
  useEffect(() => {
    const normalizedSelectedDate = startOfDay(selectedDate);
    
    const filteredEvents = events.filter(event => {
      try {
        if (!event.start_time) {
          return false;
        }
        
        const eventDate = startOfDay(parseISO(event.start_time));
        return isSameDay(eventDate, normalizedSelectedDate);
      } catch (err) {
        console.error('Error parsing event date:', err, event);
        return false;
      }
    });
    
    filteredEvents.sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    
    setDayEvents(filteredEvents);
  }, [selectedDate, events]);

  const handleAddSession = () => {
    setIsAddingEvent(true);
  };

  const handleSessionSuccess = (newEvent: CalendarEvent) => {
    // Immediately add the new event to the day's events list
    setDayEvents(prevEvents => {
      // Create a new array with the new event
      const updatedEvents = [...prevEvents, newEvent];
      
      // Sort the events by start time
      return updatedEvents.sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
    });
    
    // Also refresh the parent's events list
    onRefresh();
    
    // Close the dialog
    setIsAddingEvent(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this study session?')) {
      await deleteEvent(eventId);
      
      // Remove the event from the local state immediately
      setDayEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      
      // Also refresh the parent's events list
      onRefresh();
    }
  };

  const handleEditSession = (event: CalendarEvent) => {
    setEditingEvent(event);
  };

  const handleLaunchSession = (event: CalendarEvent) => {
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
        
        {(isAddingEvent || editingEvent) && (
          <StudySessionDialog
            open={isAddingEvent || !!editingEvent}
            onOpenChange={(open) => {
              if (!open) {
                setIsAddingEvent(false);
                setEditingEvent(null);
              }
            }}
            selectedDate={selectedDate}
            onSuccess={handleSessionSuccess}
            eventToEdit={editingEvent}
            existingEvents={events} // Pass all events for time validation
          />
        )}
      </div>
    </div>
  );
};

export default DayPlannerView;
