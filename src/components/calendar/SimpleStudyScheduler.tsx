
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { addDays, format, startOfWeek, addWeeks, subWeeks, parseISO } from 'date-fns';
import { ArrowLeft, ArrowRight, Plus, Clock } from 'lucide-react';
import { useCalendarEvents, CalendarEvent } from '@/hooks/useCalendarEvents';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import CreateStudySession from './CreateStudySession';
import { cn } from '@/lib/utils';

interface DayEvent {
  id: string;
  title: string;
  subject?: string;
  time: string;
  duration: number;
  color: string;
  local_only?: boolean;
}

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

const defaultColor = 'bg-gray-100 border-gray-300 text-gray-800';

const SimpleStudyScheduler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { events, fetchEvents, isLoading } = useCalendarEvents();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [weekEvents, setWeekEvents] = useState<{ [key: string]: DayEvent[] }>({});
  
  useEffect(() => {
    fetchEvents();
  }, []);
  
  useEffect(() => {
    if (!isLoading && events) {
      organizeEventsByDay();
    }
  }, [events, currentWeekStart, isLoading]);
  
  const organizeEventsByDay = () => {
    const organizedEvents: { [key: string]: DayEvent[] } = {};
    
    // Initialize days of the week
    for (let i = 0; i < 7; i++) {
      const day = addDays(currentWeekStart, i);
      const dateKey = format(day, 'yyyy-MM-dd');
      organizedEvents[dateKey] = [];
    }
    
    // Add events to their respective days
    events.forEach(event => {
      const startDate = new Date(event.start_time);
      const dateKey = format(startDate, 'yyyy-MM-dd');
      
      // Check if this event belongs to the current week
      if (organizedEvents[dateKey] !== undefined) {
        const startHour = startDate.getHours();
        const startMinutes = startDate.getMinutes();
        const formattedTime = `${startHour.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`;
        
        const endDate = new Date(event.end_time);
        const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
        
        const color = event.subject && subjectColorMap[event.subject] 
          ? subjectColorMap[event.subject] 
          : defaultColor;
        
        organizedEvents[dateKey].push({
          id: event.id,
          title: event.title,
          subject: event.subject,
          time: formattedTime,
          duration: durationMinutes,
          color,
          local_only: event.local_only
        });
      }
    });
    
    // Sort events by time
    Object.keys(organizedEvents).forEach(date => {
      organizedEvents[date].sort((a, b) => {
        return a.time.localeCompare(b.time);
      });
    });
    
    setWeekEvents(organizedEvents);
  };
  
  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };
  
  const handleAddSession = (day: Date) => {
    setSelectedDay(day);
    setShowAddEventDialog(true);
  };
  
  const handleEventSuccess = (event: CalendarEvent) => {
    fetchEvents();
    toast({
      title: event.local_only ? "Local Session Added" : "Session Scheduled",
      description: event.local_only 
        ? "Your study session has been added to your local calendar." 
        : "Your study session has been added to the calendar",
    });
  };
  
  const handleEventClick = (event: DayEvent) => {
    navigate(`/study?sessionId=${event.id}${event.subject ? `&subject=${event.subject}` : ''}`);
  };
  
  const getDaysOfWeek = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(currentWeekStart, i);
      days.push({
        date: day,
        displayDate: format(day, 'd'),
        dayName: format(day, 'EEE'),
        dateKey: format(day, 'yyyy-MM-dd'),
        isToday: format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
      });
    }
    return days;
  };
  
  const weekDays = getDaysOfWeek();
  
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Study Schedule</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {format(currentWeekStart, 'dd MMM')} - {format(addDays(currentWeekStart, 6), 'dd MMM yyyy')}
          </span>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div key={day.dateKey} className="text-center">
            <div className={cn(
              "rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-1",
              day.isToday ? "bg-primary text-primary-foreground" : "text-gray-700"
            )}>
              {day.displayDate}
            </div>
            <div className="text-xs font-medium text-gray-500 mb-2">{day.dayName}</div>
          </div>
        ))}
        
        {weekDays.map((day) => (
          <Card key={`card-${day.dateKey}`} className={cn(
            "h-64 overflow-y-auto",
            day.isToday && "border-primary"
          )}>
            <CardContent className="p-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Clock className="animate-spin h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-xs text-gray-400">Loading...</span>
                </div>
              ) : weekEvents[day.dateKey]?.length > 0 ? (
                <div className="space-y-2">
                  {weekEvents[day.dateKey].map((event) => (
                    <div 
                      key={event.id}
                      className={`p-2 rounded border ${event.color} cursor-pointer hover:shadow-sm transition-shadow ${event.local_only ? 'border-dashed' : ''}`}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="font-medium text-xs">{event.title}</div>
                      <div className="flex justify-between items-center text-xs mt-1">
                        <span>{event.time}</span>
                        <span>{Math.round(event.duration / 60 * 10) / 10}h</span>
                      </div>
                      {event.local_only && (
                        <div className="text-xs italic text-gray-500 mt-1">Local only</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 rounded-full p-0 mb-1"
                    onClick={() => handleAddSession(day.date)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-xs">Add session</span>
                </div>
              )}
              
              {weekEvents[day.dateKey]?.length > 0 && (
                <div className="mt-2 flex justify-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 rounded text-xs"
                    onClick={() => handleAddSession(day.date)}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <CreateStudySession 
        isOpen={showAddEventDialog}
        onClose={() => setShowAddEventDialog(false)}
        initialDate={selectedDay || new Date()}
        onSuccess={handleEventSuccess}
      />
    </>
  );
};

export default SimpleStudyScheduler;
