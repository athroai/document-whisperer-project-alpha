
import { useState } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';

export const useLocalCalendarEvents = () => {
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);
  const { toast } = useToast();

  const addLocalEvent = (event: CalendarEvent) => {
    setLocalEvents(prev => [...prev, event]);
    toast({
      title: "Event Created",
      description: "Local calendar event added.",
    });
  };

  const updateLocalEvent = (id: string, updates: Partial<CalendarEvent>): boolean => {
    try {
      const updatedEvents = localEvents.map(event => 
        event.id === id ? { ...event, ...updates } : event
      );
      
      setLocalEvents(updatedEvents);
      
      toast({
        title: "Success",
        description: "Local calendar event updated.",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating local event:', error);
      toast({
        title: "Error",
        description: "Failed to update local event.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteLocalEvent = (id: string): boolean => {
    try {
      const filteredEvents = localEvents.filter(event => event.id !== id);
      setLocalEvents(filteredEvents);
      
      toast({
        title: "Success",
        description: "Local calendar event deleted.",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting local event:', error);
      toast({
        title: "Error",
        description: "Failed to delete local event.",
        variant: "destructive",
      });
      return false;
    }
  };

  const clearLocalEvents = () => {
    setLocalEvents([]);
  };

  return {
    localEvents,
    addLocalEvent,
    updateLocalEvent,
    deleteLocalEvent,
    clearLocalEvents
  };
};
