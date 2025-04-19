
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
  local_only?: boolean; // Indicates if this is stored only locally
}

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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

  // Fetch events from the database
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
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
      
      let dbEvents: CalendarEvent[] = [];
      
      if (userId) {
        try {
          const { data, error } = await supabase
            .from('calendar_events')
            .select('*')
            .or(`student_id.eq.${userId},user_id.eq.${userId}`);

          if (error) {
            console.error('Error fetching calendar events:', error);
            // Don't throw, we'll just use local events
          } else if (data) {
            dbEvents = data.map(event => {
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
            });
          }
        } catch (dbError) {
          console.error('Database error fetching events:', dbError);
        }
      }
      
      // Combine database events and local events, preferring database versions
      const dbEventIds = new Set(dbEvents.map(event => event.id));
      const filteredLocalEvents = localEvents.filter(event => !dbEventIds.has(event.id));
      
      const combinedEvents = [...dbEvents, ...filteredLocalEvents];
      setEvents(combinedEvents);
      
      return combinedEvents;
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      
      // If all else fails, return at least the local events
      setEvents(localEvents);
      return localEvents;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [toast]);

  // Create a new calendar event
  const createEvent = async (
    eventData: {
      title?: string;
      subject?: string;
      topic?: string;
      start_time: string;
      end_time: string;
      event_type?: string;
    }, 
    allowLocalFallback: boolean = false
  ): Promise<CalendarEvent | null> => {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
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
          if (allowLocalFallback) {
            throw new Error('No user found for database operation, using local fallback');
          } else {
            throw new Error('No authenticated user found');
          }
        }
      }
      
      if (!userId) {
        if (allowLocalFallback) {
          throw new Error('No user found for database operation, using local fallback');
        } else {
          toast({
            title: "Authentication Required",
            description: "You need to be logged in to create events",
            variant: "destructive",
          });
          throw new Error('No authenticated user found');
        }
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
        console.error('Error creating calendar event in database:', error);
        if (allowLocalFallback) {
          throw new Error('Database error: ' + error.message);
        } else {
          throw error; 
        }
      }
      
      if (!data) {
        if (allowLocalFallback) {
          throw new Error('No data returned from database insert');
        } else {
          throw new Error('Failed to create calendar event - no data returned');
        }
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
      
      // If local fallback is allowed and there was a database error, create a local event
      if (allowLocalFallback) {
        const localId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const localEvent: CalendarEvent = {
          id: localId,
          title: eventData.title || `${eventData.subject || 'Study'} Session`,
          subject: eventData.subject || '',
          topic: eventData.topic || '',
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          event_type: eventData.event_type || 'study_session',
          local_only: true
        };
        
        setLocalEvents(prev => [...prev, localEvent]);
        setEvents(prev => [...prev, localEvent]);
        
        toast({
          title: "Local Session Created",
          description: "Study session saved to your browser (not synced to server).",
        });
        
        return localEvent;
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create session. Please try again.",
          variant: "destructive",
        });
        return null;
      }
    }
  };

  // Update an existing calendar event
  const updateEvent = async (id: string, updates: Partial<CalendarEvent>): Promise<boolean> => {
    // Check if this is a local event
    const isLocalEvent = id.startsWith('local-') || localEvents.some(e => e.id === id);
    
    if (isLocalEvent) {
      try {
        const updatedLocalEvents = localEvents.map(event => 
          event.id === id ? { ...event, ...updates } : event
        );
        
        setLocalEvents(updatedLocalEvents);
        
        // Update the combined events list too
        setEvents(prevEvents => 
          prevEvents.map(event => event.id === id ? { ...event, ...updates } : event)
        );
        
        localStorage.setItem('athro_calendar_events', JSON.stringify(updatedLocalEvents));
        
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
      // Handle database event update
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
    // Check if this is a local event
    const isLocalEvent = id.startsWith('local-') || localEvents.some(e => e.id === id);
    
    if (isLocalEvent) {
      try {
        const filteredEvents = localEvents.filter(event => event.id !== id);
        setLocalEvents(filteredEvents);
        
        // Update the combined events list too
        setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
        
        localStorage.setItem('athro_calendar_events', JSON.stringify(filteredEvents));
        
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
