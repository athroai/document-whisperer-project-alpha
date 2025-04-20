
import { useState } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

// Type extended to allow selfCreated events
type SessionCreationPayload = {
  title: string;
  subject: string;
  topic?: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  eventType?: string;
  selfCreated?: boolean; // If true, ONLY set student_id
};

export const useSessionCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { state: authState } = useAuth();
  const { toast } = useToast();

  // Generic calendar event creation logic
  const createCalendarSession = async (
    sessionData: SessionCreationPayload
  ): Promise<CalendarEvent | null> => {
    const { selfCreated = false } = sessionData;
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

      const startISOString = startTime instanceof Date ? startTime.toISOString() : startTime;
      const endISOString = endTime instanceof Date ? endTime.toISOString() : endTime;

      // For onboarding or self-created sessions: only set student_id.
      const insertObj: any = {
        title,
        description: eventDescription,
        event_type: eventType,
        start_time: startISOString,
        end_time: endISOString
      };
      if (selfCreated) {
        insertObj.student_id = authState.user.id;
      } else {
        // Allow both (for classic user-created cases)
        insertObj.user_id = authState.user.id;
        insertObj.student_id = authState.user.id;
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .insert(insertObj)
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

  // Batch creation now accepts selfCreated option and retry logic.
  const createBatchCalendarSessions = async (
    sessions: Array<SessionCreationPayload>,
    batchOptions?: { selfCreated?: boolean, maxRetries?: number }
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
    const opts = batchOptions || {};
    const selfCreated = opts.selfCreated ?? false; // Used for onboarding
    const maxRetries = opts.maxRetries ?? 2;

    // Helper for retry logic
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    try {
      for (let i = 0; i < sessions.length; i++) {
        let retryCount = 0;
        let event = null;
        while (retryCount <= maxRetries) {
          try {
            const sessionPayload = { ...sessions[i], selfCreated };
            event = await createCalendarSession(sessionPayload);
            if (event) break; // Success!
          } catch (err) {
            // Wait increasing time on failure
            await delay(400 + retryCount * 200);
          }
          retryCount++;
        }
        if (event) {
          createdEvents.push(event);
        } else {
          toast({
            title: "A session could not be created",
            description: `Session #${i + 1} failed after ${maxRetries + 1} attempts.`,
            variant: "destructive"
          });
        }
      }

      if (createdEvents.length > 0) {
        toast({
          title: "Study Plan Created",
          description: `Created ${createdEvents.length} study sessions in your calendar.`,
        });
        localStorage.removeItem('cached_calendar_events');
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
