
import React from 'react';
import BigCalendarView from './BigCalendarView';
import CalendarEmptyState from './CalendarEmptyState';
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
  needsOnboarding, 
  refreshTrigger,
  onRetryLoad 
}: CalendarContainerProps) => {
  return (
    <>
      <BigCalendarView 
        key={`calendar-${refreshTrigger}`}
        onRetryLoad={onRetryLoad}
        showRefreshButton={false}
      />
      {events.length === 0 && !isLoading && (
        <CalendarEmptyState 
          needsOnboarding={needsOnboarding}
          onRefresh={onRetryLoad}
        />
      )}
    </>
  );
};

export default CalendarContainer;
