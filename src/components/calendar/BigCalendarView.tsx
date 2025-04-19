import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, isSameMonth, isToday } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import CreateStudySession from './CreateStudySession';
import { Badge } from '@/components/ui/badge';
import { getEventColor } from '@/utils/calendarUtils';
import { fromGMTString, formatGMTTime } from '@/utils/timeUtils';
import { Skeleton } from '@/components/ui/skeleton';

interface BigCalendarViewProps {
  onRetryLoad?: () => void;
}

const BigCalendarView: React.FC<BigCalendarViewProps> = ({ onRetryLoad }) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const { events, suggestedEvents, isLoading } = useCalendarEvents();
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    console.log(`BigCalendarView: Rendering with ${events.length} events`);
    
    // Set a timeout to prevent infinite loading state
    const timer = setTimeout(() => {
      setLocalLoading(false);
    }, 3000);
    
    // We're not calling fetchEvents() here anymore to prevent loops
    // Just update the local loading state based on existing events
    setLocalLoading(false);
    clearTimeout(timer);
    
    return () => clearTimeout(timer);
  }, [events]);
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowCreateDialog(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
  };
  
  const handleRetry = () => {
    setLocalLoading(true);
    if (onRetryLoad) onRetryLoad();
    
    // The parent component will handle the actual fetching
    setTimeout(() => {
      setLocalLoading(false);
    }, 3000);
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
        <div className="flex gap-2">
          <Button 
            onClick={handleRetry}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={() => setShowCreateDialog(true)} 
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Session
          </Button>
        </div>
      </div>

      {isLoading || localLoading ? (
        <Card className="shadow-md border-gray-200">
          <CardContent className="p-4">
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-[500px] w-full" />
          </CardContent>
        </Card>
      ) : events.length === 0 ? (
        <Card className="shadow-md border-gray-200">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              No study sessions found in your calendar.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => setShowCreateDialog(true)} variant="outline">
                Create your first study session
              </Button>
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
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
      )}

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

// Add the renderCalendar function from the original file
BigCalendarView.prototype.renderCalendar = function() {
  const monthStart = startOfMonth(this.state.currentMonth);
  const monthEnd = endOfMonth(this.state.currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return monthDays.map((day, index) => {
    const dayEvents = this.getEventsForDay(day);
    const isCurrentMonth = isSameMonth(day, this.state.currentMonth);

    return (
      <div 
        key={index} 
        className={`border p-2 ${!isCurrentMonth ? 'bg-gray-100 text-gray-400' : 'bg-white'} cursor-pointer hover:bg-gray-50`}
        onClick={() => isCurrentMonth && this.handleDateSelect(day)}
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

export default BigCalendarView;
