
import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/types/calendar';

export const useLocalEvents = () => {
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);

  // Load local events from localStorage on mount
  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem('athro_calendar_events');
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents) as CalendarEvent[];
        setLocalEvents(parsedEvents);
      }
    } catch (error) {
      console.error('Error loading local events:', error);
    }
  }, []);

  // Save local events to localStorage whenever they change
  useEffect(() => {
    if (localEvents.length > 0) {
      localStorage.setItem('athro_calendar_events', JSON.stringify(localEvents));
    }
  }, [localEvents]);

  return {
    localEvents,
    setLocalEvents
  };
};
