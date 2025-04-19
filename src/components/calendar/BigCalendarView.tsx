
import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarEvent } from '@/types/calendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CreateStudySession from './CreateStudySession';
import { useState } from 'react';
import { Plus } from 'lucide-react';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const BigCalendarView: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { events, fetchEvents } = useCalendarEvents();
  
  const calendarEvents = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start_time),
      end: new Date(event.end_time),
      resource: {
        subject: event.subject,
        topic: event.topic,
        local_only: event.local_only
      }
    }));
  }, [events]);
  
  const handleSelect = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    setShowCreateDialog(true);
  };

  const handleCreateSuccess = () => {
    fetchEvents();
    setShowCreateDialog(false);
  };

  const eventStyleGetter = (event: any) => {
    const subjectColorMap: Record<string, string> = {
      'Mathematics': 'bg-purple-100 border-purple-300 text-purple-800',
      'Science': 'bg-blue-100 border-blue-300 text-blue-800',
      'English': 'bg-green-100 border-green-300 text-green-800',
      'History': 'bg-amber-100 border-amber-300 text-amber-800',
      'Geography': 'bg-teal-100 border-teal-300 text-teal-800',
      'Welsh': 'bg-red-100 border-red-300 text-red-800',
      'Languages': 'bg-indigo-100 border-indigo-300 text-indigo-800',
      'Religious Education': 'bg-pink-100 border-pink-300 text-pink-800'
    };

    const subject = event.resource?.subject || 'General';
    const classNameParts = subjectColorMap[subject]?.split(' ') || ['bg-gray-100', 'border-gray-300', 'text-gray-800'];
    const backgroundColor = classNameParts[0];
    const borderColor = classNameParts[1];
    const textColor = classNameParts[2];

    return {
      className: `${backgroundColor} ${borderColor} ${textColor} font-medium`,
      style: {
        border: event.resource?.local_only ? '2px dashed' : '1px solid',
        borderRadius: '4px',
        padding: '2px 4px'
      }
    };
  };

  // Add the CSS to the document head
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .athro-calendar .rbc-header {
        background-color: #f8f7fd;
        padding: 10px;
        font-weight: 600;
      }
      .athro-calendar .rbc-event {
        padding: 4px 6px !important;
        border-radius: 4px !important;
      }
      .athro-calendar .rbc-event-content {
        font-size: 0.95em;
      }
      .athro-calendar .rbc-today {
        background-color: #f0eaff;
      }
      .athro-calendar .rbc-selected {
        background-color: rgba(155, 135, 245, 0.2) !important;
      }
      .athro-calendar .rbc-toolbar {
        margin-bottom: 1rem;
      }
      .athro-calendar .rbc-toolbar button {
        border-radius: 0.375rem;
        padding: 0.5rem 0.75rem;
      }
      .athro-calendar .rbc-toolbar button.rbc-active {
        background-color: #9b87f5;
        color: white;
      }
    `;
    document.head.appendChild(style);
    
    // Clean up function to remove style when component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Study Calendar</h2>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Session
        </Button>
      </div>

      <Card className="p-4 shadow-md">
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            defaultView={Views.WEEK}
            eventPropGetter={eventStyleGetter}
            selectable
            onSelectSlot={handleSelect}
            tooltipAccessor={event => `${event.title} ${event.resource?.topic ? `- ${event.resource.topic}` : ''}`}
            className="athro-calendar"
          />
        </div>
      </Card>

      <CreateStudySession
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        initialDate={selectedDate || new Date()}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default BigCalendarView;
