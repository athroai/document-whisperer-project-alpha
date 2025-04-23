import React from 'react';
import BigCalendarView from './BigCalendarView';
import { CalendarEvent } from '@/types/calendar';

interface CalendarContainerProps {
  events: CalendarEvent[];
  isLoading: boolean;
  needsOnboarding: boolean;
  refreshTrigger: number;
  onRetryLoad: () => void;
}

const CalendarContainer = ({ 
  events, 
  isLoading, 
  refreshTrigger,
  onRetryLoad 
}: CalendarContainerProps) => {
  return (
    <BigCalendarView 
      key={`calendar-${refreshTrigger}`}
      onRetryLoad={onRetryLoad}
      showRefreshButton={false}
    />
  );
};

export default CalendarContainer;
