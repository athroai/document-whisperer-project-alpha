
import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { format, parse } from 'date-fns';
import { toGMTString } from '@/utils/timeUtils';

export const useStudySessionForm = (
  initialDate: Date,
  onClose: () => void,
  onSuccess?: (event: CalendarEvent) => void
) => {
  const [title, setTitle] = useState('Study Session');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(format(initialDate, 'yyyy-MM-dd'));
  const [hour, setHour] = useState(15);
  const [minute, setMinute] = useState(0);
  const [duration, setDuration] = useState('60');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createEvent } = useCalendarEvents();
  const { toast } = useToast();

  useEffect(() => {
    setDate(format(initialDate, 'yyyy-MM-dd'));
  }, [initialDate]);

  const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  const handleHourChange = (value: number[]) => {
    setHour(value[0]);
  };

  const handleMinuteChange = (value: number[]) => {
    setMinute(value[0]);
  };

  const resetForm = () => {
    setTitle('Study Session');
    setSubject('');
    setTopic('');
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!subject) {
        toast({
          title: "Subject Required",
          description: "Please select a subject for this study session",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const startTime = new Date(`${date}T${timeString}`);
      const gmtStartTime = toGMTString(startTime);

      const durationMinutes = parseInt(duration, 10);
      const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
      const gmtEndTime = toGMTString(endTime);

      const event = await createEvent({
        title: title || `${subject} Study Session`,
        subject,
        topic,
        start_time: gmtStartTime,
        end_time: gmtEndTime,
        event_type: 'study_session',
        timezone: 'GMT'
      }, true);

      resetForm();
      onClose();

      if (event && onSuccess) {
        onSuccess(event);
      }
    } catch (error) {
      console.error('Error creating study session:', error);
      toast({
        title: "Error",
        description: "Failed to create study session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formState: {
      title,
      subject,
      topic,
      date,
      hour,
      minute,
      duration,
      timeString,
      isSubmitting
    },
    setTitle,
    setSubject,
    setTopic,
    setDate,
    handleHourChange,
    handleMinuteChange,
    setDuration,
    handleSubmit
  };
};
