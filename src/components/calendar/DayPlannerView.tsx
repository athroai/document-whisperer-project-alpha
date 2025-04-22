
import React, { useState, useEffect } from 'react';
import { parseISO, startOfDay, isSameDay } from 'date-fns';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarEvent } from '@/types/calendar';
import DayPlannerHeader from './DayPlannerHeader';
import DayPlannerEvents from './DayPlannerEvents';
import StudySessionDialog from './StudySessionDialog';
import EditStudySessionDialog from './EditStudySessionDialog';
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
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const { deleteEvent, updateEvent, markEventComplete } = useCalendarEvents();
  const { toast } = useToast();

  useEffect(() => {
    // Normalize selectedDate to start of day to ensure proper comparison
    const normalizedSelectedDate = startOfDay(selectedDate);
    const filteredEvents = events.filter(event => {
      try {
        if (!event.start_time) return false;
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

  const handleSessionSuccess = () => {
    onRefresh();
    setIsAddingEvent(false);
  };

  const handleEditSession = (event: CalendarEvent) => {
    setEditingEvent(event);
  };

  const handleEditSessionSave = async (updates: Partial<CalendarEvent>) => {
    if (editingEvent) {
      await updateEvent(editingEvent.id, updates);
      onRefresh();
      setEditingEvent(null);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this study session?')) {
      await deleteEvent(eventId);
      onRefresh();
    }
  };

  const handleLaunchSession = (event: CalendarEvent) => {
    toast({
      title: `Launching ${event.subject || "Study"} Session`,
      description: "Launching study session — feature coming soon!",
    });
  };

  const handleMarkComplete = async (event: CalendarEvent, completed: boolean) => {
    await markEventComplete(event.id, completed);
    onRefresh();
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
            onEdit={handleEditSession}
            onLaunch={handleLaunchSession}
            onMarkComplete={handleMarkComplete}
            onAddSession={handleAddSession}
          />
        </div>
        <StudySessionDialog
          open={isAddingEvent}
          onOpenChange={setIsAddingEvent}
          selectedDate={selectedDate}
          onSuccess={handleSessionSuccess}
        />
        <EditStudySessionDialog
          open={!!editingEvent}
          onOpenChange={(open) => {
            if (!open) setEditingEvent(null);
          }}
          event={editingEvent}
          onSave={handleEditSessionSave}
        />
      </div>
    </div>
  );
};

export default DayPlannerView;
