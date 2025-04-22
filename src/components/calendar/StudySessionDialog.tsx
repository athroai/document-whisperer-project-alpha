
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { athroCharacters } from '@/config/athrosConfig';
import { useSubjects } from '@/hooks/useSubjects';
import { useStudySessionForm } from '@/hooks/calendar/useStudySessionForm';
import TimeSelector from './TimeSelector';
import { CalendarEvent } from '@/types/calendar';
import { parseISO, format, isBefore } from 'date-fns';

interface StudySessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onSuccess?: () => void;
  eventToEdit?: CalendarEvent | null;
  existingEvents?: CalendarEvent[];
}

const StudySessionDialog = ({
  open,
  onOpenChange,
  selectedDate,
  onSuccess,
  eventToEdit,
  existingEvents = []
}: StudySessionDialogProps) => {
  const {
    formState,
    setTitle,
    setSubject,
    setTopic,
    setDate,
    setStartTime,
    setDuration,
    handleSubmit: submitForm,
    setEventId
  } = useStudySessionForm(selectedDate);

  const { subjects, isLoading } = useSubjects();
  const { toast } = useToast();

  useEffect(() => {
    if (eventToEdit) {
      const startDate = parseISO(eventToEdit.start_time);
      setTitle(eventToEdit.title || '');
      setSubject(eventToEdit.subject || 'Mathematics');
      setTopic(eventToEdit.topic || '');
      setDate(format(startDate, 'yyyy-MM-dd'));
      setStartTime(format(startDate, 'HH:mm'));
      setDuration(eventToEdit.duration_minutes || 60);
      if (eventToEdit.id) {
        setEventId(eventToEdit.id);
      }
    }
  }, [eventToEdit, setTitle, setSubject, setTopic, setDate, setStartTime, setDuration, setEventId]);

  const validateTimeOrder = (selectedTime: string) => {
    const currentDate = `${formState.date}T${selectedTime}`;
    const selectedDateTime = new Date(currentDate);
    
    // Filter events for the same day
    const sameDay = existingEvents?.filter(event => {
      const eventDate = new Date(event.start_time);
      return format(eventDate, 'yyyy-MM-dd') === formState.date;
    });

    // If editing, exclude the current event from comparison
    const otherEvents = sameDay.filter(event => event.id !== eventToEdit?.id);
    
    // Check if the selected time is after all previous events
    const hasPreviousEventAfter = otherEvents.some(event => {
      const eventTime = new Date(event.start_time);
      return isBefore(selectedDateTime, eventTime);
    });

    return !hasPreviousEventAfter;
  };

  const handleSubmit = async () => {
    try {
      if (!formState.startTime) {
        toast({
          title: "Invalid Time",
          description: "Please select a start time",
          variant: "destructive",
        });
        return;
      }

      // Validate time order
      if (!validateTimeOrder(formState.startTime)) {
        toast({
          title: "Invalid Time",
          description: "New sessions must be scheduled after existing sessions for this day",
          variant: "destructive",
        });
        return;
      }

      await submitForm();
      if (onSuccess) onSuccess();
      onOpenChange(false);

      toast({
        title: eventToEdit ? 'Study Session Updated' : 'Study Session Scheduled',
        description: eventToEdit ?
          'Your study session has been updated.' :
          'Your study session has been added to your calendar.',
      });
    } catch (error) {
      console.error('Error with study session:', error);
      toast({
        title: 'Error',
        description: `There was a problem ${eventToEdit ? 'updating' : 'scheduling'} your study session.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{eventToEdit ? 'Edit Study Session' : 'Schedule Study Session'}</DialogTitle>
          <DialogDescription>
            {eventToEdit ? 'Modify your study session details' : 'Create a new study session'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Session Title (Optional)</Label>
              <Input
                id="title"
                placeholder={`Study: ${formState.subject}${formState.topic ? ` - ${formState.topic}` : ''}`}
                value={formState.title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={formState.subject}
                onValueChange={setSubject}
              >
                <SelectTrigger id="subject" className="mt-1.5">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subj) => (
                    <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="topic">Topic (Optional)</Label>
              <Select
                value={formState.topic}
                onValueChange={setTopic}
              >
                <SelectTrigger id="topic" className="mt-1.5">
                  <SelectValue placeholder="Select Topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">General Study</SelectItem>
                  {athroCharacters
                    .find(char => char.subject === formState.subject)
                    ?.topics.map((topic) => (
                      <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <TimeSelector
              date={formState.date}
              startTime={formState.startTime}
              duration={formState.duration}
              onDateChange={setDate}
              onStartTimeChange={setStartTime}
              onDurationChange={setDuration}
              existingTimes={existingEvents?.map(e => format(new Date(e.start_time), 'HH:mm'))}
            />
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button
            onClick={handleSubmit}
            className="w-full sm:w-auto"
            disabled={formState.isSubmitting}
          >
            {formState.isSubmitting 
              ? 'Saving...' 
              : (eventToEdit ? 'Update Session' : 'Schedule Session')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudySessionDialog;
