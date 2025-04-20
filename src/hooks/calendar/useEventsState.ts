
import { useState } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';

export const useEventsState = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const { toast } = useToast();

  const clearEvents = () => {
    setEvents([]);
    localStorage.removeItem('cached_calendar_events');
  };

  return {
    events,
    setEvents,
    isLoading,
    setIsLoading,
    lastRefreshedAt,
    setLastRefreshedAt,
    clearEvents,
    toast
  };
};
