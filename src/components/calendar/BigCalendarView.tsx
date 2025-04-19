
import React, { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarEvent } from '@/types/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CreateStudySession from './CreateStudySession';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

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
      'Mathematics': 'bg-purple-500 border-purple-600 text-white',
      'Science': 'bg-blue-500 border-blue-600 text-white',
      'English': 'bg-green-500 border-green-600 text-white',
      'History': 'bg-amber-500 border-amber-600 text-white',
      'Geography': 'bg-teal-500 border-teal-600 text-white',
      'Welsh': 'bg-red-500 border-red-600 text-white',
      'Languages': 'bg-indigo-500 border-indigo-600 text-white',
      'Religious Education': 'bg-pink-500 border-pink-600 text-white'
    };

    const subject = event.resource?.subject || 'General';
    const classNameParts = subjectColorMap[subject]?.split(' ') || ['bg-gray-500', 'border-gray-600', 'text-white'];
    const backgroundColor = classNameParts[0];
    const borderColor = classNameParts[1];
    const textColor = classNameParts[2];

    return {
      className: `${backgroundColor} ${borderColor} ${textColor} font-medium`,
      style: {
        border: event.resource?.local_only ? '2px dashed' : '1px solid',
        borderRadius: '6px',
        opacity: 0.9,
        padding: '2px 4px'
      }
    };
  };

  // Custom toolbar component for the calendar
  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
      toolbar.onNavigate('TODAY');
    };

    return (
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Button
            onClick={goToBack}
            variant="outline"
            size="sm"
            className="border-purple-200 hover:bg-purple-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={goToCurrent}
            variant="outline"
            size="sm"
            className="border-purple-200 hover:bg-purple-50"
          >
            Today
          </Button>
          <Button
            onClick={goToNext}
            variant="outline"
            size="sm"
            className="border-purple-200 hover:bg-purple-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h3 className="text-lg font-medium text-center">
          {format(toolbar.date, 'MMMM yyyy')}
        </h3>
        <div className="flex space-x-2">
          {['month', 'week', 'day'].map(view => (
            <Button
              key={view}
              onClick={() => toolbar.onView(view)}
              variant={toolbar.view === view ? "default" : "outline"}
              size="sm"
              className={toolbar.view === view ? "bg-purple-600 hover:bg-purple-700" : "border-purple-200 hover:bg-purple-50"}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  // Add the CSS to the document head
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .athro-calendar .rbc-header {
        background-color: #f9f7ff;
        padding: 12px;
        font-weight: 600;
        border: none;
        border-bottom: 1px solid #e5e7eb;
      }
      .athro-calendar .rbc-event {
        padding: 4px 8px !important;
        border-radius: 6px !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .athro-calendar .rbc-event-content {
        font-size: 0.95em;
        white-space: normal;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .athro-calendar .rbc-today {
        background-color: rgba(155, 135, 245, 0.1);
      }
      .athro-calendar .rbc-date-cell {
        padding: 4px 8px;
      }
      .athro-calendar .rbc-off-range-bg {
        background-color: #f8fafc;
      }
      .athro-calendar .rbc-off-range {
        color: #9ca3af;
      }
      .athro-calendar .rbc-day-bg + .rbc-day-bg {
        border-left: 1px solid #f1f1f4;
      }
      .athro-calendar .rbc-month-row + .rbc-month-row {
        border-top: 1px solid #f1f1f4;
      }
      .athro-calendar .rbc-row-segment {
        padding: 2px 4px;
      }
      .athro-calendar .rbc-selected {
        background-color: rgba(155, 135, 245, 0.2) !important;
      }
      .athro-calendar .rbc-day-slot .rbc-time-slot {
        border-top: 1px dotted #e5e7eb;
      }
      .athro-calendar .rbc-timeslot-group {
        border-bottom: 1px solid #e5e7eb;
      }
      .athro-calendar .rbc-time-content > * + * > * {
        border-left: 1px solid #e5e7eb;
      }
      .athro-calendar .rbc-time-view-resources .rbc-time-gutter,
      .athro-calendar .rbc-time-view-resources .rbc-time-header-gutter {
        background-color: #f9f7ff;
      }
      .athro-calendar .rbc-month-view {
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        overflow: hidden;
      }
      .athro-calendar .rbc-time-view {
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        overflow: hidden;
      }
      .athro-calendar .rbc-agenda-view {
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        overflow: hidden;
      }
      .athro-calendar .rbc-day-slot .rbc-event {
        border-left: 4px solid rgba(0,0,0,0.15);
      }
      .athro-calendar .rbc-agenda-view table.rbc-agenda-table {
        border: none;
      }
      .athro-calendar .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
        background-color: #f9f7ff;
        padding: 12px;
        font-weight: 600;
        border-bottom: 1px solid #e5e7eb;
      }
      .athro-calendar .rbc-time-header.rbc-overflowing {
        border-right: 1px solid #e5e7eb;
      }
    `;
    document.head.appendChild(style);
    
    // Clean up function to remove style when component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Study Calendar</h2>
        <Button 
          onClick={() => setShowCreateDialog(true)} 
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Session
        </Button>
      </div>

      <Card className="shadow-md border-gray-200">
        <CardContent className="p-4">
          <div className="h-[700px]">
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
              tooltipAccessor={(event: any) => `${event.title} ${event.resource?.topic ? `- ${event.resource.topic}` : ''}`}
              className="athro-calendar"
              components={{
                toolbar: CustomToolbar
              }}
              popup
            />
          </div>
        </CardContent>
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
