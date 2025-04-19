
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  topic?: string;
  start_time: string;
  end_time: string;
  event_type: string;
  user_id?: string;
  student_id?: string;
}

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch events from the database
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      
      // Support for mock users in development environment
      let userId = user?.id;
      
      if (!userId && localStorage.getItem('athro_user')) {
        try {
          const mockUser = JSON.parse(localStorage.getItem('athro_user') || '{}');
          if (mockUser.id) {
            userId = mockUser.id;
            console.log('Using mock user ID for calendar:', userId);
          }
        } catch (err) {
          console.warn('Error parsing mock user:', err);
        }
      }
      
      if (!userId) {
        console.log('No authenticated user found');
        setEvents([]);
        return [];
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .or(`student_id.eq.${userId},user_id.eq.${userId}`);

      if (error) {
        console.error('Error fetching calendar events:', error);
        throw error;
      }
      
      const formattedEvents = data?.map(event => {
        let subject = '';
        let topic = '';
        
        if (event.description) {
          try {
            const parsed = JSON.parse(event.description);
            subject = parsed.subject || '';
            topic = parsed.topic || '';
          } catch (e) {
            console.warn('Failed to parse event description:', e);
          }
        }
        
        return {
          id: event.id,
          title: event.title,
          description: event.description,
          subject: subject,
          topic: topic,
          start_time: event.start_time,
          end_time: event.end_time,
          event_type: event.event_type || 'study_session',
          user_id: event.user_id,
          student_id: event.student_id
        };
      }) || [];
      
      setEvents(formattedEvents);
      return formattedEvents;
      
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar events. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [toast]);

  // Create a new calendar event
  const createEvent = async (eventData: {
    title?: string;
    subject?: string;
    topic?: string;
    start_time: string;
    end_time: string;
    event_type?: string;
  }): Promise<CalendarEvent | null> => {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      
      // Support for mock users in development environment
      let userId = user?.id;
      
      if (!userId && localStorage.getItem('athro_user')) {
        try {
          const mockUser = JSON.parse(localStorage.getItem('athro_user') || '{}');
          if (mockUser.id) {
            userId = mockUser.id;
            console.log('Using mock user ID for event creation:', userId);
          }
        } catch (err) {
          console.warn('Error parsing mock user:', err);
          throw new Error('No authenticated user found');
        }
      }
      
      if (!userId) {
        toast({
          title: "Authentication Required",
          description: "You need to be logged in to create events",
          variant: "destructive",
        });
        throw new Error('No authenticated user found');
      }
      
      // Create event description
      const eventDescription = JSON.stringify({
        subject: eventData.subject || '',
        topic: eventData.topic || '',
        isPomodoro: true,
        pomodoroWorkMinutes: 25,
        pomodoroBreakMinutes: 5
      });
      
      // Prepare event data
      const eventInsert = {
        title: eventData.title || `${eventData.subject || 'Study'} Session`,
        description: eventDescription,
        user_id: userId,
        student_id: userId,
        event_type: eventData.event_type || 'study_session',
        start_time: eventData.start_time,
        end_time: eventData.end_time
      };

      console.log('Creating calendar event:', eventInsert);
      
      // Insert the event
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(eventInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating calendar event:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Failed to create calendar event - no data returned');
      }
      
      const newEvent: CalendarEvent = {
        id: data.id,
        title: data.title,
        description: data.description,
        subject: eventData.subject || '',
        topic: eventData.topic || '',
        start_time: data.start_time,
        end_time: data.end_time,
        event_type: data.event_type || 'study_session',
        user_id: data.user_id,
        student_id: data.student_id
      };
      
      setEvents(prevEvents => [...prevEvents, newEvent]);
      
      toast({
        title: "Success",
        description: "Study session created successfully.",
      });
      
      return newEvent;
      
    } catch (error: any) {
      console.error('Error creating calendar event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create session. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update an existing calendar event
  const updateEvent = async (id: string, updates: Partial<CalendarEvent>): Promise<boolean> => {
    try {
      // Prepare update data
      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.start_time) updateData.start_time = updates.start_time;
      if (updates.end_time) updateData.end_time = updates.end_time;
      
      // Update description if subject or topic changes
      if (updates.subject || updates.topic) {
        // Get current event first
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
      
      // Update the event
      const { error } = await supabase
        .from('calendar_events')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      // Refresh events list
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

  // Delete a calendar event
  const deleteEvent = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
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
    createEvent,
    updateEvent,
    deleteEvent
  };
};
