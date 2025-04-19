
import { useState } from 'react';
import { format, addMinutes, parse } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { toGMTString } from '@/utils/timeUtils';

export const useStudySessionForm = (
  initialDate: Date = new Date(),
  onClose?: () => void,
  onSuccess?: (event: CalendarEvent) => void
) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(format(initialDate, 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('15:00');
  const [duration, setDuration] = useState('30');
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createEvent } = useCalendarEvents();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Parse the date and time
      const dateTimeStr = `${date}T${startTime}`;
      const startDateTime = parse(dateTimeStr, 'yyyy-MM-ddTHH:mm', new Date());
      
      // Calculate end time based on duration
      const durationInMinutes = parseInt(duration, 10);
      const endDateTime = addMinutes(startDateTime, durationInMinutes);
      
      const eventData = {
        title: title || `${subject} Study Session`,
        subject,
        topic,
        start_time: toGMTString(startDateTime),
        end_time: toGMTString(endDateTime),
        event_type: 'study_session'
      };
      
      const createdEvent = await createEvent(eventData, true);
      
      if (onSuccess && createdEvent) {
        onSuccess(createdEvent);
      }
      
      if (onClose) {
        onClose();
      }
      
    } catch (error) {
      console.error('Error creating study session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formState: {
      title,
      date,
      startTime,
      duration,
      subject,
      topic,
      isSubmitting
    },
    setTitle,
    setDate,
    setStartTime,
    setDuration,
    setSubject,
    setTopic,
    handleSubmit
  };
};
