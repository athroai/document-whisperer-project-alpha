import React, { useState, useCallback } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  addMonths, 
  startOfWeek, 
  endOfWeek 
} from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import CalendarHeader from './CalendarHeader';
import CalendarNavigation from './CalendarNavigation';
import CalendarGrid from './CalendarGrid';
import DayPlannerView from './DayPlannerView';

interface BigCalendarViewProps {
  onRetryLoad?: () => void;
  showRefreshButton?: boolean;
}

const BigCalendarView: React.FC<BigCalendarViewProps> = ({ 
  onRetryLoad,
  showRefreshButton = true
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(new Date()));
  
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleCloseDayPlanner = useCallback(() => {
    setSelectedDate(null);
    
    // If an onRetryLoad function was passed, call it to refresh events
    if (onRetryLoad) {
      setTimeout(() => {
        onRetryLoad();
      }, 500);
    }
  }, [onRetryLoad]);

  const previousMonth = useCallback(() => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, -1));
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  }, []);

  // Get all days from the start of the first week to the end of the last week of the month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const monthDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const handleAddSession = useCallback(() => {
    setSelectedDate(new Date());
  }, []);
  
  const { events, isLoading } = useCalendarEvents();
  const { subjects } = useUserSubjects();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[600px] w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <CalendarHeader
        onRefresh={onRetryLoad || (() => {})}
        onAddSession={handleAddSession}
        showRefreshButton={showRefreshButton}
      />

      <Card className="shadow-md border-gray-200">
        <CardContent className="p-4">
          <CalendarNavigation
            currentMonth={currentMonth}
            onPreviousMonth={previousMonth}
            onNextMonth={nextMonth}
          />
          
          <CalendarGrid
            days={monthDays}
            currentMonth={currentMonth}
            events={events}
            onSelectDate={handleDateSelect}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 mt-4">
        {subjects.map(subj => {
          const colorStyle = getEventColor(subj.subject);
          return (
            <Badge 
              key={subj.subject}
              className={`${colorStyle.bg} ${colorStyle.text} hover:${colorStyle.bg}`}
            >
              {subj.subject}
            </Badge>
          );
        })}
      </div>

      {selectedDate && (
        <DayPlannerView
          selectedDate={selectedDate}
          onClose={handleCloseDayPlanner}
          events={events}
          isLoading={isLoading}
          onRefresh={onRetryLoad || (() => {})}
        />
      )}
    </div>
  );
};

export default BigCalendarView;
