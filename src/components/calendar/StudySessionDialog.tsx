
import React, { useEffect, useState } from 'react';
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
  onSuccess?: (event: CalendarEvent) => void;
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

  const { subjects } = useSubjects();
  const { toast } = useToast();
  const [timeError, setTimeError] = useState<string | null>(null);

  useEffect(() => {
    if (eventToEdit) {
      const startDate = parseISO(eventToEdit.start_time);
      setTitle(eventToEdit.title || '');
      setSubject(eventToEdit.subject || 'Mathematics');
      setTopic(eventToEdit.topic || '');
      setDate(format(startDate, 'yyyy-MM-dd'));
      setStartTime(format(startDate, 'HH:mm'));
      if (eventToEdit.id) {
        setEventId(eventToEdit.id);
      }
      
      // Calculate duration from start and end time
      const endDate = parseISO(eventToEdit.end_time);
      const durationInMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
      setDuration(durationInMinutes);
    }
  }, [eventToEdit, setTitle, setSubject, setTopic, setDate, setStartTime, setDuration, setEventId]);

  const validateTimeOrder = (date: string, time: string): boolean => {
    // If editing an event, don't check against itself
    const eventsToCheck = eventToEdit 
      ? existingEvents.filter(e => e.id !== eventToEdit.id) 
      : existingEvents;

    // Selected date and time
    const selectedDateTime = new Date(`${date}T${time}`);

    // Check if selected time is after existing sessions on the same day
    const sameDay = eventsToCheck.filter(event => {
      const eventDate = format(new Date(event.start_time), 'yyyy-MM-dd');
      return eventDate === date;
    });

    // Sort sessions by time
    const sortedSessions = [...sameDay].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    // If no sessions or all sessions are before this one, it's valid
    const hasConflicts = sortedSessions.some(session => {
      const sessionDateTime = new Date(session.start_time);
      return isBefore(selectedDateTime, sessionDateTime);
    });

    return !hasConflicts;
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

      // Validate that the selected time comes after existing sessions for the day
      if (!validateTimeOrder(formState.date, formState.startTime)) {
        setTimeError("New sessions must be scheduled after existing sessions for the day");
        toast({
          title: "Invalid Time Selection",
          description: "New sessions must be scheduled after existing sessions for the day",
          variant: "destructive",
        });
        return;
      }

      const result = await submitForm();
      
      // The TypeScript error was here - checking void for truthiness
      // Now we directly call onSuccess if it exists
      if (result && onSuccess) {
        onSuccess(result);
      }
      
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
                  <SelectItem key="general-study" value="General Study">General Study</SelectItem>
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
              onStartTimeChange={(time) => {
                setStartTime(time);
                setTimeError(null); // Clear error when time changes
              }}
              onDurationChange={setDuration}
              existingTimes={existingEvents?.map(e => format(new Date(e.start_time), 'HH:mm'))}
              errorMessage={timeError}
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
