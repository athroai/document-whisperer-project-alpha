
import React, { useState } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, addMonths } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import CreateStudySession from './CreateStudySession';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import CalendarHeader from './CalendarHeader';
import CalendarNavigation from './CalendarNavigation';
import CalendarGrid from './CalendarGrid';

interface BigCalendarViewProps {
  onRetryLoad?: () => void;
}

const BigCalendarView: React.FC<BigCalendarViewProps> = ({ onRetryLoad }) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const { events, isLoading } = useCalendarEvents();

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowCreateDialog(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
  };

  const previousMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, -1));
  };

  const nextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

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
        onAddSession={() => setShowCreateDialog(true)}
      />

      {events.length === 0 ? (
        <Card className="shadow-md border-gray-200">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              No study sessions found in your calendar.
            </p>
          </CardContent>
        </Card>
      ) : (
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

export default BigCalendarView;
