
import React, { useState, useCallback } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import CalendarHeader from './CalendarHeader';
import CalendarNavigation from './CalendarNavigation';
import CalendarGrid from './CalendarGrid';
import DayPlannerView from './DayPlannerView';
import SubjectBadges from './SubjectBadges';

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
    if (onRetryLoad) {
      setTimeout(onRetryLoad, 500);
    }
  }, [onRetryLoad]);

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
            onPreviousMonth={() => setCurrentMonth(prev => addMonths(prev, -1))}
            onNextMonth={() => setCurrentMonth(prev => addMonths(prev, 1))}
          />
          
          <CalendarGrid
            days={monthDays}
            currentMonth={currentMonth}
            events={events}
            onSelectDate={handleDateSelect}
          />
        </CardContent>
      </Card>

      <SubjectBadges subjects={subjects} />

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
