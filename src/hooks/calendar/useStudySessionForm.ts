import { useState, useEffect } from 'react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useSessionCreation } from './useSessionCreation';
import { format, addMinutes, startOfDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { CalendarEvent } from '@/types/calendar';

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
  onSuccess?: (event: CalendarEvent) => void,
  eventToEdit?: CalendarEvent | null
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
  
  useEffect(() => {
    if (eventToEdit) {
      try {
        const startDate = new Date(eventToEdit.start_time);
        const endDate = new Date(eventToEdit.end_time);
        const durationInMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
        
        setFormState({
          title: eventToEdit.title || '',
          subject: eventToEdit.subject || 'Mathematics',
          topic: eventToEdit.topic || '',
          date: format(startDate, 'yyyy-MM-dd'),
          startTime: format(startDate, 'HH:mm'),
          duration: durationInMinutes,
          isSubmitting: false,
          eventId: eventToEdit.id
        });
      } catch (error) {
        console.error("Error initializing form with event data:", error);
      }
    }
  }, [eventToEdit]);

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

  const handleSubmit = async (): Promise<CalendarEvent | undefined> => {
    try {
      setFormState(prev => ({ ...prev, isSubmitting: true }));
      
      const dateStr = `${formState.date}T${formState.startTime}`;
      const startDateTime = new Date(dateStr);
      const endDateTime = addMinutes(startDateTime, formState.duration);
      
      const defaultTitle = `${formState.subject} Study Session`;
      const sessionTitle = formState.title || defaultTitle;
      
      let resultEvent: CalendarEvent | undefined;
      
      if (formState.eventId) {
        console.log("Updating calendar event:", formState.eventId);
        
        resultEvent = await updateEvent(formState.eventId, {
          title: sessionTitle,
          subject: formState.subject,
          topic: formState.topic,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          event_type: 'study_session'
        });
        
        if (resultEvent) {
          console.log("Event updated successfully:", resultEvent);
        } else {
          console.error("Failed to update event");
        }
      } else {
        console.log("Creating new calendar session");
        
        resultEvent = await createCalendarSession({
          title: sessionTitle,
          subject: formState.subject,
          topic: formState.topic,
          startTime: startDateTime,
          endTime: endDateTime
        });
        
        if (!resultEvent) {
          console.log("Session creation failed, falling back to legacy method");
          resultEvent = await createEvent({
            title: sessionTitle,
            subject: formState.subject,
            topic: formState.topic,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            event_type: 'study_session'
          }, true);
        }
      }
      
      if (resultEvent && onSuccess) {
        console.log("Calling onSuccess with event:", resultEvent);
        onSuccess(resultEvent);
      }
      
      return resultEvent;
    } catch (error) {
      console.error('Error creating/updating study session:', error);
      throw error;
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const resetForm = () => {
    setFormState({
      title: '',
      subject: 'Mathematics',
      topic: '',
      date: format(dateToUse, 'yyyy-MM-dd'),
      startTime: defaultStartTime,
      duration: 60,
      isSubmitting: false,
      eventId: undefined
    });
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
    handleSubmit,
    resetForm
  };
};
