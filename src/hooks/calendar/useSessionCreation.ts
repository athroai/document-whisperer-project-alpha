
import { useState } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export const useSessionCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { state: authState } = useAuth();
  const { toast } = useToast();

  const createCalendarSession = async (
    sessionData: {
      title: string;
      subject: string;
      topic?: string;
      startTime: Date;
      endTime: Date;
      description?: string;
      eventType?: string;
    }
  ): Promise<CalendarEvent | null> => {
    if (!authState.user?.id) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to create sessions",
        variant: "destructive"
      });
      return null;
    }

    setIsCreating(true);

    try {
      console.log("Creating calendar session with data:", sessionData);
      const {
        title,
        subject,
        topic = "",
        startTime,
        endTime,
        eventType = "study_session"
      } = sessionData;

      // Prepare event description as JSON
      const eventDescription = JSON.stringify({
        subject,
        topic,
        isPomodoro: true,
        pomodoroWorkMinutes: 25,
        pomodoroBreakMinutes: 5
      });

      // Make sure dates are in ISO string format for database insertion
      const startISOString = startTime instanceof Date ? startTime.toISOString() : startTime;
      const endISOString = endTime instanceof Date ? endTime.toISOString() : endTime;
      
      console.log(`Inserting event: ${title} from ${startISOString} to ${endISOString}`);

      // Create event in database
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          title: title,
          description: eventDescription,
          user_id: authState.user.id,
          student_id: authState.user.id,
          event_type: eventType,
          start_time: startISOString,
          end_time: endISOString
        })
        .select('*')
        .single();

      if (error) {
        console.error("Error creating calendar event:", error);
        toast({
          title: "Session Creation Failed",
          description: "There was an error creating your study session. Please try again.",
          variant: "destructive"
        });
        return null;
      }

      console.log("Successfully created calendar event:", data);

      // Convert the database response to a CalendarEvent
      const newEvent: CalendarEvent = {
        id: data.id,
        title: data.title,
        subject,
        topic,
        description: data.description,
        start_time: data.start_time,
        end_time: data.end_time,
        event_type: data.event_type,
        user_id: data.user_id,
        student_id: data.student_id,
      };

      return newEvent;
    } catch (error) {
      console.error("Exception in createCalendarSession:", error);
      toast({
        title: "Unexpected Error",
        description: "Failed to create study session. Please try again later.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const createBatchCalendarSessions = async (
    sessions: Array<{
      title: string;
      subject: string;
      topic?: string;
      startTime: Date;
      endTime: Date;
      eventType?: string;
    }>
  ): Promise<CalendarEvent[]> => {
    if (!authState.user?.id) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to create sessions",
        variant: "destructive"
      });
      return [];
    }
    
    setIsCreating(true);
    const createdEvents: CalendarEvent[] = [];

    try {
      console.log(`Attempting to create ${sessions.length} calendar sessions`);
      
      // Process sessions sequentially to avoid database race conditions
      for (const session of sessions) {
        console.log(`Processing session: ${session.title} at ${session.startTime}`);
        const newEvent = await createCalendarSession(session);
        if (newEvent) {
          console.log(`Successfully created event: ${newEvent.id}`);
          createdEvents.push(newEvent);
        }
      }

      console.log(`Created ${createdEvents.length} out of ${sessions.length} sessions`);
      
      if (createdEvents.length > 0) {
        toast({
          title: "Study Plan Created",
          description: `Created ${createdEvents.length} study sessions in your calendar.`,
        });
      } else {
        toast({
          title: "Warning",
          description: "No study sessions were created. Please try again.",
          variant: "default"
        });
      }

      return createdEvents;
    } catch (error) {
      console.error("Error in batch creation:", error);
      toast({
        title: "Partial Completion",
        description: `Created ${createdEvents.length} of ${sessions.length} sessions. Some sessions may have failed.`,
        variant: "default"
      });
      return createdEvents;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    isCreating,
    createCalendarSession,
    createBatchCalendarSessions
  };
};
