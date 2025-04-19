
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubjects } from '@/hooks/useSubjects';
import { CalendarEvent } from '@/types/calendar';
import TimeSelector from './TimeSelector';
import { useStudySessionForm } from '@/hooks/calendar/useStudySessionForm';

interface CreateStudySessionProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  onSuccess?: (event: CalendarEvent) => void;
}

const CreateStudySession: React.FC<CreateStudySessionProps> = ({
  isOpen,
  onClose,
  initialDate = new Date(),
  onSuccess
}) => {
  const { subjects } = useSubjects();
  const {
    formState,
    setTitle,
    setSubject,
    setTopic,
    setDate,
    setStartTime,
    setDuration,
    handleSubmit
  } = useStudySessionForm(initialDate, onClose, onSuccess);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule a Study Session</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input
              id="title"
              value={formState.title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="My Study Session"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">Subject</Label>
            <Select value={formState.subject} onValueChange={setSubject}>
              <SelectTrigger id="subject" className="col-span-3">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subj) => (
                  <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="topic" className="text-right">Topic (optional)</Label>
            <Input
              id="topic"
              value={formState.topic}
              onChange={(e) => setTopic(e.target.value)}
              className="col-span-3"
              placeholder="Optional topic"
            />
          </div>

          <div className="col-span-4">
            <TimeSelector
              date={formState.date}
              startTime={formState.startTime}
              duration={formState.duration}
              onDateChange={setDate}
              onStartTimeChange={setStartTime}
              onDurationChange={setDuration}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'Creating...' : 'Create Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStudySession;
