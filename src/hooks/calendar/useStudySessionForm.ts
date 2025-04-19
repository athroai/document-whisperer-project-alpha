
import { useState } from 'react';
import { format } from 'date-fns';

export const useStudySessionForm = (selectedDate?: Date) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('15:00');
  const [duration, setDuration] = useState('30');
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  return {
    formData: {
      title,
      date,
      startTime,
      duration,
      subject,
      topic,
      isSubmitting
    },
    setters: {
      setTitle,
      setDate,
      setStartTime,
      setDuration,
      setSubject,
      setTopic,
      setIsSubmitting
    }
  };
};
