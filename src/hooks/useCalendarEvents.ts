
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { CalendarEvent } from '@/types/calendar';
import { useLocalEvents } from './calendar/useLocalEvents';
import { fetchDatabaseEvents, createDatabaseEvent } from '@/services/calendarEventService';
import { useAuth } from '@/contexts/AuthContext';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { localEvents, setLocalEvents, clearLocalEvents } = useLocalEvents();
  const { toast } = useToast();
  const { state: authState } = useAuth();

  const clearEvents = () => {
    setEvents([]);
    clearLocalEvents();
  };

  const getCurrentUserId = () => {
    if (authState.user?.id) {
      return authState.user.id;
    }
    
    return null;
  };

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      
      const userId = getCurrentUserId();
      
      if (!userId) {
        console.log('No authenticated user, not fetching calendar events');
        setEvents([]);
        return [];
      }

      const dbEvents = await fetchDatabaseEvents(userId);
      
      const dbEventIds = new Set(dbEvents.map(event => event.id));
      const filteredLocalEvents = localEvents.filter(event => !dbEventIds.has(event.id));
      
      const combinedEvents = [...dbEvents, ...filteredLocalEvents];
      setEvents(combinedEvents);
      
      return combinedEvents;
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      setEvents(localEvents);
      return localEvents;
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async (
    eventData: Partial<CalendarEvent>,
    allowLocalFallback: boolean = false
  ): Promise<CalendarEvent> => {
    try {
      const userId = getCurrentUserId();
      
      if (!userId) {
        if (!allowLocalFallback) {
          throw new Error('No authenticated user found');
        }
        throw new Error('No user found for database operation');
      }

      const newEvent = await createDatabaseEvent(userId, eventData);
      
      if (newEvent) {
        setEvents(prevEvents => [...prevEvents, newEvent]);
        toast({
          title: "Success",
          description: "Study session created successfully.",
        });
        return newEvent;
      }
      
      throw new Error('Failed to create database event');
      
    } catch (error) {
      console.error('Error creating calendar event:', error);
      
      const localId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const localEvent: CalendarEvent = {
        id: localId,
        title: eventData.title || `${eventData.subject || 'Study'} Session`,
        subject: eventData.subject || '',
        topic: eventData.topic || '',
        start_time: eventData.start_time!,
        end_time: eventData.end_time!,
        event_type: eventData.event_type || 'study_session',
        local_only: true
      };
      
      const updatedLocalEvents = [...localEvents, localEvent];
      setLocalEvents(updatedLocalEvents);
      setEvents(prev => [...prev, localEvent]);
      
      return localEvent;
    }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>): Promise<boolean> => {
    const isLocalEvent = id.startsWith('local-') || localEvents.some(e => e.id === id);
    
    if (isLocalEvent) {
      try {
        const updatedLocalEvents = localEvents.map(event => 
          event.id === id ? { ...event, ...updates } : event
        );
        
        setLocalEvents(updatedLocalEvents);
        setEvents(prevEvents => 
          prevEvents.map(event => event.id === id ? { ...event, ...updates } : event)
        );
        
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
    }
    
    try {
      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.start_time) updateData.start_time = updates.start_time;
      if (updates.end_time) updateData.end_time = updates.end_time;
      
      if (updates.subject || updates.topic) {
        const { data: currentEvent } = await supabase
          .from('calendar_events')
          .select('description')
          .eq('id', id)
          .single();
          
        let descriptionObj = {};
        try {
          if (currentEvent?.description) {
            descriptionObj = JSON.parse(currentEvent.description);
          }
        } catch (e) {
          console.warn('Failed to parse existing description');
        }
        
        updateData.description = JSON.stringify({
          ...descriptionObj,
          subject: updates.subject || (descriptionObj as any).subject || '',
          topic: updates.topic || (descriptionObj as any).topic || '',
        });
      }
      
      const { error } = await supabase
        .from('calendar_events')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      fetchEvents();
      
      toast({
        title: "Success",
        description: "Calendar event updated successfully.",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    const isLocalEvent = id.startsWith('local-') || localEvents.some(e => e.id === id);
    
    if (isLocalEvent) {
      try {
        const filteredEvents = localEvents.filter(event => event.id !== id);
        setLocalEvents(filteredEvents);
        setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
        
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
    }
    
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setEvents(events.filter(event => event.id !== id));
      
      toast({
        title: "Success",
        description: "Calendar event deleted successfully.",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    events,
    isLoading,
    fetchEvents,
    clearEvents,
    createEvent,
    updateEvent,
    deleteEvent
  };
};
