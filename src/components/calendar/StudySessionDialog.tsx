
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
import { parseISO, format } from 'date-fns';

interface StudySessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onSuccess?: () => void;
  eventToEdit?: CalendarEvent | null;
}

const StudySessionDialog = ({
  open,
  onOpenChange,
  selectedDate,
  onSuccess,
  eventToEdit
}: StudySessionDialogProps) => {
  const {
    formState,
    setTitle,
    setSubject,
    setTopic,
    setDate,
    setStartTime,
    setDuration,
    handleSubmit: submitForm
  } = useStudySessionForm(selectedDate);

  const { subjects, isLoading } = useSubjects();
  const { toast } = useToast();

  useEffect(() => {
    if (eventToEdit) {
      const startDate = parseISO(eventToEdit.start_time);
      const endDate = parseISO(eventToEdit.end_time);
      const durationInMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

      setTitle(eventToEdit.title || '');
      setSubject(eventToEdit.subject || 'Mathematics');
      setTopic(eventToEdit.topic || '');
      setDate(format(startDate, 'yyyy-MM-dd'));
      setStartTime(format(startDate, 'HH:mm'));
      setDuration(durationInMinutes);
    }
  }, [eventToEdit, setTitle, setSubject, setTopic, setDate, setStartTime, setDuration]);

  const getTopicsForSubject = (subj: string) => {
    const character = athroCharacters.find(char => char.subject.toLowerCase() === subj.toLowerCase());
    return character ? character.topics : [];
  };

  const currentTopics = getTopicsForSubject(formState.subject);
  const availableSubjects = subjects.length > 0 ? subjects : athroCharacters.map(char => char.subject);

  const handleSubmit = async () => {
    try {
      const hour = new Date(`${formState.date}T${formState.startTime}`).getHours();
      if (hour < 15 || hour > 23) {
        toast({
          title: "Invalid Time",
          description: "Please select a time between 3 PM and 11 PM",
          variant: "destructive",
        });
        return;
      }

      await submitForm(eventToEdit?.id);

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
            {eventToEdit ? 'Modify your study session details' : 'Create a new study session with your Athro mentor'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Session Title (Optional)</Label>
            <Input
              id="title"
              placeholder={`Study: ${formState.subject}${formState.topic ? ` - ${formState.topic}` : ''}`}
              value={formState.title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={formState.subject}
              onValueChange={setSubject}
            >
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading">Loading subjects...</SelectItem>
                ) : availableSubjects.length > 0 ? (
                  availableSubjects.map((subj) => (
                    <SelectItem key={subj} value={subj}>
                      {subj}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none">No subjects available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic">Topic (Optional)</Label>
            <Select
              value={formState.topic}
              onValueChange={setTopic}
            >
              <SelectTrigger id="topic">
                <SelectValue placeholder="Select Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Study</SelectItem>
                {currentTopics.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
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
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={formState.isSubmitting}
          >
            {formState.isSubmitting ? 'Saving...' : (eventToEdit ? 'Update Session' : 'Schedule Session')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudySessionDialog;
