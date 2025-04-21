
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
  const { events, isLoading } = useCalendarEvents();
  
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
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Mathematics</Badge>
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Science</Badge>
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">English</Badge>
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">History</Badge>
        <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200">Geography</Badge>
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Other</Badge>
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
