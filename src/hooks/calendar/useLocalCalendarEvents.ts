
import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/types/calendar';

export const useLocalCalendarEvents = () => {
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    try {
      const cachedEvents = localStorage.getItem('cached_calendar_events');
      if (cachedEvents) {
        const parsed = JSON.parse(cachedEvents);
        if (Array.isArray(parsed)) {
          setLocalEvents(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading cached calendar events:', error);
    }
  }, []);

  const saveLocalEvent = (event: CalendarEvent) => {
    try {
      const updated = [...localEvents, event];
      setLocalEvents(updated);
      localStorage.setItem('cached_calendar_events', JSON.stringify(updated));
      return event;
    } catch (error) {
      console.error('Error saving local event:', error);
      return null;
    }
  };

  const clearLocalEvents = () => {
    try {
      localStorage.removeItem('cached_calendar_events');
      setLocalEvents([]);
    } catch (error) {
      console.error('Error clearing local events:', error);
    }
  };

  return {
    localEvents,
    saveLocalEvent,
    clearLocalEvents
  };
};
