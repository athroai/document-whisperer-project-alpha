
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        if (!user) {
          console.log('No authenticated user found');
          setEvents([]);
          return;
        }

        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
        toast({
          title: "Error",
          description: "Failed to load calendar events. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [toast]);

  const createEvent = async (eventData: {
    subject: string;
    topic?: string;
    start_time: string;
    end_time: string;
    event_type?: string;
    title?: string;
  }) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) throw new Error('No authenticated user found');

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: user.id,
          student_id: user.id,
          event_type: eventData.event_type || 'study_session',
          title: eventData.title || `${eventData.subject} Study Session`,
          description: JSON.stringify({
            subject: eventData.subject,
            topic: eventData.topic,
            isPomodoro: true,
            pomodoroWorkMinutes: 25,
            pomodoroBreakMinutes: 5
          }),
          start_time: eventData.start_time,
          end_time: eventData.end_time
        })
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [...prev, data]);
      
      toast({
        title: "Success",
        description: "Study session scheduled successfully.",
      });

      return data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      toast({
        title: "Error",
        description: "Failed to schedule study session. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    events,
    isLoading,
    createEvent
  };
};
