
import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';

export const useLocalEvents = () => {
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);
  const { state: authState } = useAuth();

  // Generate a storage key based on the current user ID
  const getStorageKey = () => {
    const userId = authState.user?.id || 'anonymous';
    return `athro_calendar_events_${userId}`;
  };

  // Clear local events
  const clearLocalEvents = () => {
    setLocalEvents([]);
  };

  // Load local events from localStorage on mount or when user changes
  useEffect(() => {
    try {
      // Clear existing events first
      clearLocalEvents();
      
      if (authState.user?.id) {
        const savedEvents = localStorage.getItem(getStorageKey());
        if (savedEvents) {
          const parsedEvents = JSON.parse(savedEvents) as CalendarEvent[];
          setLocalEvents(parsedEvents);
        }
      }
    } catch (error) {
      console.error('Error loading local events:', error);
    }
  }, [authState.user?.id]);

  // Save local events to localStorage whenever they change
  useEffect(() => {
    if (authState.user?.id && localEvents.length > 0) {
      localStorage.setItem(getStorageKey(), JSON.stringify(localEvents));
    }
  }, [localEvents, authState.user?.id]);

  return {
    localEvents,
    setLocalEvents,
    clearLocalEvents
  };
};
