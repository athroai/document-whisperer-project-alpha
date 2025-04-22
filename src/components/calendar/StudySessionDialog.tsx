
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
import { parseISO, format, addMinutes } from 'date-fns';

interface StudySessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onSuccess?: (event: CalendarEvent) => void;
  eventToEdit?: CalendarEvent | null;
  existingEvents?: CalendarEvent[];
}

const StudySessionDialog: React.FC<StudySessionDialogProps> = ({
  open,
  onOpenChange,
  selectedDate,
  onSuccess,
  eventToEdit,
  existingEvents = []
}) => {
  const { subjects } = useSubjects();
  const { toast } = useToast();
  const [timeError, setTimeError] = useState<string | null>(null);
  
  // Pass eventToEdit directly to the hook for initialization
  const {
    formState,
    setTitle,
    setSubject,
    setTopic,
    setDate,
    setStartTime,
    setDuration,
    handleSubmit: submitForm,
    resetForm
  } = useStudySessionForm(selectedDate, undefined, onSuccess, eventToEdit);

  // Handle form submission
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

      if (checkForTimeConflicts(formState.date, formState.startTime, formState.duration)) {
        setTimeError("This time slot overlaps with an existing session. Please choose another time.");
        toast({
          title: "Time Conflict",
          description: "This time slot overlaps with an existing session. Please choose another time.",
          variant: "destructive",
        });
        return;
      }

      const result = await submitForm();
      
      if (result) {
        onOpenChange(false);
        resetForm();

        toast({
          title: eventToEdit ? 'Study Session Updated' : 'Study Session Scheduled',
          description: eventToEdit ?
            'Your study session has been updated.' :
            'Your study session has been added to your calendar.',
        });
      }
    } catch (error) {
      console.error('Error with study session:', error);
      toast({
        title: 'Error',
        description: `There was a problem ${eventToEdit ? 'updating' : 'scheduling'} your study session.`,
        variant: 'destructive',
      });
    }
  };

  const checkForTimeConflicts = (date: string, time: string, duration: number): boolean => {
    const selectedDateTime = new Date(`${date}T${time}`);
    const selectedEndDateTime = addMinutes(selectedDateTime, duration);

    return existingEvents.some(event => {
      // Skip comparing with the event being edited
      if (eventToEdit && event.id === eventToEdit.id) {
        return false;
      }

      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);

      // Check if the intervals overlap
      return (
        (selectedDateTime >= eventStart && selectedDateTime < eventEnd) ||
        (selectedEndDateTime > eventStart && selectedEndDateTime <= eventEnd) ||
        (selectedDateTime <= eventStart && selectedEndDateTime >= eventEnd)
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        resetForm();
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl">
            {eventToEdit ? 'Edit Study Session' : 'Schedule Study Session'}
          </DialogTitle>
          <DialogDescription>
            {eventToEdit ? 'Modify your study session details' : 'Create a new study session'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">Session Title</Label>
              <Input
                id="title"
                name="title"
                placeholder={`Study: ${formState.subject}${formState.topic ? ` - ${formState.topic}` : ''}`}
                value={formState.title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                <Select
                  value={formState.subject}
                  onValueChange={setSubject}
                  name="subject"
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {subjects.map((subj) => (
                      <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-sm font-medium">Topic (Optional)</Label>
                <Select
                  value={formState.topic}
                  onValueChange={setTopic}
                  name="topic"
                >
                  <SelectTrigger id="topic">
                    <SelectValue placeholder="Select Topic" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    <SelectItem value="General Study">General Study</SelectItem>
                    {athroCharacters
                      .find(char => char.subject === formState.subject)
                      ?.topics.map((topic) => (
                        <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <TimeSelector
              date={formState.date}
              startTime={formState.startTime}
              duration={formState.duration}
              onDateChange={setDate}
              onStartTimeChange={setStartTime}
              onDurationChange={setDuration}
              existingTimes={existingEvents?.map(e => format(new Date(e.start_time), 'HH:mm'))}
              checkConflicts={checkForTimeConflicts}
              existingEvents={existingEvents}
              currentEventId={formState.eventId}
              errorMessage={timeError}
            />
          </div>
        </div>
        
        <DialogFooter className="pt-4 border-t space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
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
