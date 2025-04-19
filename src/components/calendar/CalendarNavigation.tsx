
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarNavigationProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const CalendarNavigation = ({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
}: CalendarNavigationProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <Button onClick={onPreviousMonth} variant="outline">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <h3 className="text-lg font-medium">
        {format(currentMonth, 'MMMM yyyy')}
      </h3>
      <Button onClick={onNextMonth} variant="outline">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CalendarNavigation;
