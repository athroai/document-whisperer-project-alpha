
import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, isSameMonth, isToday } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import CreateStudySession from './CreateStudySession';
import { Badge } from '@/components/ui/badge';
import { CalendarEvent } from '@/types/calendar';
import { getEventColor } from '@/utils/calendarUtils';
import { fromGMTString, formatGMTTime } from '@/utils/timeUtils';

const BigCalendarView: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const { events, suggestedEvents, fetchEvents } = useCalendarEvents();
  
  useEffect(() => {
    fetchEvents().catch(err => {
      console.error('Error fetching initial events:', err);
    });
  }, [fetchEvents]);
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowCreateDialog(true);
  };

  const handleCreateSuccess = () => {
    fetchEvents().catch(err => {
      console.error('Error fetching events after creation:', err);
    });
    setShowCreateDialog(false);
  };

  const previousMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, -1));
  };

  const nextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  const getEventsForDay = (day: Date) => {
    const allEvents = [...events, ...suggestedEvents].filter(Boolean);
    
    return allEvents.filter(event => {
      try {
        if (!event.start_time) return false;
        
        const eventStart = fromGMTString(event.start_time);
        return eventStart.getFullYear() === day.getFullYear() &&
               eventStart.getMonth() === day.getMonth() &&
               eventStart.getDate() === day.getDate();
      } catch (err) {
        console.error('Error parsing event date:', err, event);
        return false;
      }
    });
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return monthDays.map((day, index) => {
      const dayEvents = getEventsForDay(day);
      const isCurrentMonth = isSameMonth(day, currentMonth);

      return (
        <div 
          key={index} 
          className={`border p-2 ${!isCurrentMonth ? 'bg-gray-100 text-gray-400' : 'bg-white'} cursor-pointer hover:bg-gray-50`}
          onClick={() => isCurrentMonth && handleDateSelect(day)}
        >
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${isToday(day) ? 'bg-purple-600 text-white rounded-full px-2 py-1' : ''}`}>
              {format(day, 'd')}
            </span>
          </div>
          {dayEvents.slice(0, 2).map((event, eventIndex) => {
            const colorStyle = getEventColor(event.subject);
            
            return (
              <div 
                key={`${event.id}-${eventIndex}`}
                className={`text-xs p-1 mb-1 rounded truncate ${colorStyle.bg} ${colorStyle.text}`}
                title={`${event.title} (${formatGMTTime(event.start_time)})`}
              >
                {formatGMTTime(event.start_time)} - {event.title}
              </div>
            );
          })}
          {dayEvents.length > 2 && (
            <div className="text-xs text-gray-500 text-center">
              +{dayEvents.length - 2} more
            </div>
          )}
        </div>
      );
    });
  };

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
          <div className="flex justify-between items-center mb-4">
            <Button onClick={previousMonth} variant="outline">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <Button onClick={nextMonth} variant="outline">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="font-semibold text-gray-600">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2 mt-2">
            {renderCalendar()}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 mt-4">
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Mathematics</Badge>
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Science</Badge>
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">English</Badge>
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">History</Badge>
        <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200">Geography</Badge>
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Other</Badge>
      </div>

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
