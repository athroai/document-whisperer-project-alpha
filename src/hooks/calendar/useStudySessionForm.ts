
import { useState } from 'react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useSessionCreation } from './useSessionCreation';
import { format, addMinutes } from 'date-fns';

interface FormState {
  title: string;
  subject: string;
  topic: string;
  date: string;
  startTime: string;
  duration: number;
  isSubmitting: boolean;
}

export const useStudySessionForm = (
  initialDate: Date = new Date(),
  onClose?: () => void,
  onSuccess?: (event: any) => void
) => {
  const { createEvent } = useCalendarEvents();
  const { createCalendarSession } = useSessionCreation();
  const [formState, setFormState] = useState<FormState>({
    title: '',
    subject: 'Mathematics',
    topic: '',
    date: format(initialDate, 'yyyy-MM-dd'),
    startTime: format(initialDate.getHours() < 9 || initialDate.getHours() > 17 
      ? new Date().setHours(15, 0, 0, 0) 
      : initialDate, 'HH:mm'),
    duration: 60,
    isSubmitting: false
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

  const handleSubmit = async () => {
    try {
      setFormState(prev => ({ ...prev, isSubmitting: true }));
      
      const startDateTime = new Date(`${formState.date}T${formState.startTime}`);
      const endDateTime = addMinutes(startDateTime, formState.duration);
      
      // Try the new session creation method first
      const newEvent = await createCalendarSession({
        title: formState.title,
        subject: formState.subject,
        topic: formState.topic,
        startTime: startDateTime,
        endTime: endDateTime
      });
      
      // If the new method fails, fall back to the old method
      if (!newEvent) {
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
        }
      } else if (onSuccess) {
        onSuccess(newEvent);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating study session:', error);
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
    handleSubmit
  };
};
