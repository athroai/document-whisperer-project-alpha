import { useState } from 'react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useSessionCreation } from './useSessionCreation';
import { format, addMinutes, startOfDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface FormState {
  title: string;
  subject: string;
  topic: string;
  date: string;
  startTime: string;
  duration: number;
  isSubmitting: boolean;
  eventId?: string;
}

export const useStudySessionForm = (
  initialDate: Date = new Date(),
  onClose?: () => void,
  onSuccess?: (event: any) => void
) => {
  const { createEvent, updateEvent } = useCalendarEvents();
  const { createCalendarSession } = useSessionCreation();
  const { toast } = useToast();
  
  const dateToUse = startOfDay(initialDate);
  
  const defaultStartTime = "16:00";
  
  const [formState, setFormState] = useState<FormState>({
    title: '',
    subject: 'Mathematics',
    topic: '',
    date: format(dateToUse, 'yyyy-MM-dd'),
    startTime: defaultStartTime,
    duration: 60,
    isSubmitting: false,
    eventId: undefined
  });

  const setTitle = (title: string) => {
    setFormState(prev => ({ ...prev, title }));
  };

  const setSubject = (subject: string) => {
    setFormState(prev => ({ ...prev, subject }));
  };

  const setTopic = (topic: string) => {
    setFormState(prev => ({ ...prev, topic }));
  };

  const setDate = (date: string) => {
    setFormState(prev => ({ ...prev, date }));
  };

  const setStartTime = (startTime: string) => {
    setFormState(prev => ({ ...prev, startTime }));
  };

  const setDuration = (duration: number) => {
    setFormState(prev => ({ ...prev, duration }));
  };
  
  const setEventId = (eventId: string) => {
    setFormState(prev => ({ ...prev, eventId }));
  };

  const handleSubmit = async () => {
    try {
      setFormState(prev => ({ ...prev, isSubmitting: true }));
      
      const dateStr = `${formState.date}T${formState.startTime}`;
      const startDateTime = new Date(dateStr);
      const endDateTime = addMinutes(startDateTime, formState.duration);
      
      if (formState.eventId) {
        console.log("Updating calendar event:", formState.eventId);
        
        const updatedEvent = await updateEvent(formState.eventId, {
          title: formState.title || `${formState.subject} Study Session`,
          subject: formState.subject,
          topic: formState.topic,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          event_type: 'study_session'
        });
        
        if (updatedEvent && onSuccess) {
          console.log("Event updated successfully:", updatedEvent);
          onSuccess(updatedEvent);
        } else {
          toast({
            title: "Warning",
            description: "Event may not have been updated correctly. Please check your calendar.",
            variant: "destructive"
          });
        }
        
        if (onClose) onClose();
        return;
      }
      
      console.log("Creating calendar session with:", {
        title: formState.title || `${formState.subject} Study Session`,
        subject: formState.subject,
        topic: formState.topic,
        startTime: startDateTime,
        endTime: endDateTime,
        dateString: dateStr
      });
      
      const newEvent = await createCalendarSession({
        title: formState.title || `${formState.subject} Study Session`,
        subject: formState.subject,
        topic: formState.topic,
        startTime: startDateTime,
        endTime: endDateTime
      });
      
      if (!newEvent) {
        console.log("Session creation failed, falling back to legacy method");
        
        const fallbackEvent = await createEvent({
          title: formState.title || `${formState.subject} Study Session`,
          subject: formState.subject,
          topic: formState.topic,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          event_type: 'study_session'
        }, true);
        
        if (fallbackEvent && onSuccess) {
          onSuccess(fallbackEvent);
        } else {
          toast({
            title: "Warning",
            description: "Session may not have been saved correctly. Please check your calendar.",
            variant: "destructive"
          });
        }
      } else if (onSuccess) {
        console.log("Session created successfully:", newEvent);
        onSuccess(newEvent);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating/updating study session:', error);
      toast({
        title: "Error",
        description: "Failed to save study session. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return {
    formState,
    setTitle,
    setSubject,
    setTopic,
    setDate,
    setStartTime,
    setDuration,
    setEventId,
    handleSubmit
  };
};
