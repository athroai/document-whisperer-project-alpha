
import React, { useState, useEffect, useCallback } from 'react';
import { format, parse, startOfToday, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, isSameMonth, isToday } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import CreateStudySession from './CreateStudySession';
import { Badge } from '@/components/ui/badge';
import { CalendarEvent } from '@/types/calendar';
import { getEventColor } from '@/utils/calendarUtils';

const BigCalendarView: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const { events, suggestedEvents, fetchEvents } = useCalendarEvents();
  
  // Load events when component mounts or when refreshEvents is called
  const refreshEvents = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);
  
  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);
  
  // Function to handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setShowCreateDialog(true);
    }
  };

  const handleCreateSuccess = (newEvent: CalendarEvent) => {
    // Refresh events immediately after successful creation
    refreshEvents();
    setShowCreateDialog(false);
  };

  // Go to previous month
  const previousMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, -1));
  };

  // Go to next month
  const nextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  // Go to current month
  const goToToday = () => {
    setCurrentMonth(startOfMonth(new Date()));
  };

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    const allEvents = [...events, ...suggestedEvents];
    return allEvents.filter(event => {
      const eventStart = new Date(event.start_time);
      return isSameDay(eventStart, day);
    });
  };

  // Function to determine day class based on events
  const getDayClass = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    if (dayEvents.some(e => e.suggested)) {
      return "bg-purple-50 border border-purple-300 border-dashed rounded-md relative";
    }
    if (dayEvents.length > 0) {
      return "bg-purple-50 rounded-md relative";
    }
    return "";
  };

  // Custom day rendering function
  const renderDay = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    
    return (
      <div className={`w-full h-full min-h-[100px] p-1 ${getDayClass(day)}`}>
        <div className="text-right mb-1">
          <span className={`text-sm font-medium ${isToday(day) ? 'bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
            {format(day, 'd')}
          </span>
        </div>
        {dayEvents.length > 0 && (
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event, index) => {
              const colorStyle = getEventColor(event.subject);
              return (
                <div 
                  key={event.id + index} 
                  className={`text-xs p-1 rounded truncate ${
                    event.suggested ? 'border border-dashed border-purple-400' : ''
                  } ${colorStyle.bg} ${colorStyle.text}`}
                  title={`${event.title} (${format(new Date(event.start_time), 'HH:mm')} - ${format(new Date(event.end_time), 'HH:mm')})`}
                >
                  {format(new Date(event.start_time), 'HH:mm')} - {event.title}
                </div>
              );
            })}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 font-medium text-center">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Generate calendar days for the current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group days by week
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  monthDays.forEach(day => {
    currentWeek.push(day);
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  // Add the last week if it's not complete
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

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
          <div className="flex flex-col space-y-4">
            {/* Calendar header with navigation */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <Button
                  onClick={previousMonth}
                  variant="outline"
                  size="sm"
                  className="border-purple-200 hover:bg-purple-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={goToToday}
                  variant="outline"
                  size="sm"
                  className="border-purple-200 hover:bg-purple-50"
                >
                  Today
                </Button>
                <Button
                  onClick={nextMonth}
                  variant="outline"
                  size="sm"
                  className="border-purple-200 hover:bg-purple-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="text-lg font-medium">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <div className="flex space-x-2 invisible">
                {/* Placeholder for layout balance */}
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-0 border-b border-gray-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div 
                  key={day} 
                  className="text-center py-2 font-semibold text-sm text-gray-600 bg-gray-50"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-0 border-b border-gray-200">
              {weeks.map((week, weekIndex) => (
                <React.Fragment key={`week-${weekIndex}`}>
                  {week.map((day, dayIndex) => (
                    <div 
                      key={`day-${dayIndex}`} 
                      className={`border-r border-b last:border-r-0 min-h-[120px] ${
                        isSameMonth(day, currentMonth) 
                          ? 'bg-white' 
                          : 'bg-gray-50 text-gray-400'
                      } cursor-pointer hover:bg-purple-50 transition-colors`}
                      onClick={() => handleDateSelect(day)}
                    >
                      {renderDay(day)}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend for the calendar */}
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
