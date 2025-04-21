
import React, { useState, useEffect } from 'react';
import { parseISO } from 'date-fns';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarEvent } from '@/types/calendar';
import DayPlannerHeader from './DayPlannerHeader';
import DayPlannerEvents from './DayPlannerEvents';

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

  useEffect(() => {
    const filteredEvents = events.filter(event => {
      try {
        const eventDate = parseISO(event.start_time);
        return (
          eventDate.getFullYear() === selectedDate.getFullYear() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getDate() === selectedDate.getDate()
        );
      } catch (err) {
        return false;
      }
    });
    
    filteredEvents.sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    
    setDayEvents(filteredEvents);
  }, [selectedDate, events]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(dayEvents);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setDayEvents(items);
  };

  const handleAddSession = () => {
    setIsAddingEvent(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this study session?')) {
      await deleteEvent(eventId);
      onRefresh();
    }
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
            onDragEnd={handleDragEnd}
            onAddSession={handleAddSession}
          />
        </div>
      </div>
    </div>
  );
};

export default DayPlannerView;
