
import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarEvent } from '@/types/calendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CreateStudySession from './CreateStudySession';
import { useState } from 'react';
import { Plus } from 'lucide-react';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
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
      'Mathematics': 'bg-purple-100 border-purple-300',
      'Science': 'bg-blue-100 border-blue-300',
      'English': 'bg-green-100 border-green-300',
      'History': 'bg-amber-100 border-amber-300',
      'Geography': 'bg-teal-100 border-teal-300',
      'Welsh': 'bg-red-100 border-red-300',
      'Languages': 'bg-indigo-100 border-indigo-300',
      'Religious Education': 'bg-pink-100 border-pink-300'
    };

    const subject = event.resource?.subject || 'General';
    const backgroundColor = subjectColorMap[subject]?.split(' ')[0] || 'bg-gray-100';
    const borderColor = subjectColorMap[subject]?.split(' ')[1] || 'border-gray-300';

    return {
      className: `${backgroundColor} ${borderColor} border rounded-md`,
      style: {
        border: event.resource?.local_only ? '2px dashed' : '1px solid',
      }
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Study Calendar</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Session
        </Button>
      </div>

      <Card className="p-4">
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
