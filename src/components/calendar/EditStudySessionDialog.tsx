
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarEvent } from '@/types/calendar';
import TimeSelector from './TimeSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSubjects } from '@/hooks/useSubjects';

interface EditStudySessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent | null;
  onSave: (updatedEvent: Partial<CalendarEvent>) => Promise<void>;
}

const DEFAULT_TIME = '09:00';

const EditStudySessionDialog: React.FC<EditStudySessionDialogProps> = ({
  open,
  onOpenChange,
  event,
  onSave
}) => {
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const { subjects } = useSubjects();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(''); // string for TimeSelector
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title ?? '');
      setSubject(event.subject ?? '');
      setTopic(event.topic ?? '');
      // Ensure date string is yyyy-MM-dd for date input
      if (event.start_time) {
        const dt = new Date(event.start_time);
        setDate(dt.toISOString().split('T')[0]);
        setStartTime(dt.toISOString().substring(11, 16));
      } else {
        setDate(new Date().toISOString().split('T')[0]);
        setStartTime(DEFAULT_TIME);
      }
      setDuration(
        event.start_time && event.end_time
          ? Math.round(
              (new Date(event.end_time).getTime() - new Date(event.start_time).getTime()
              ) / 60000
            )
          : 60
      );
    }
  }, [event]);

  const handleEditSave = async () => {
    if (!event) return;
    setIsSubmitting(true);
    try {
      // Construct start and end time from 'date' (yyyy-MM-dd, string) and 'startTime' (HH:mm, string)
      const start = new Date(`${date}T${startTime}`);
      const end = new Date(start.getTime() + duration * 60000);

      const updates: Partial<CalendarEvent> = {
        title,
        subject,
        topic,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      };
      await onSave(updates);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: "Couldn't update session.",
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Study Session</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">Subject</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger id="subject" className="col-span-3">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {/* Only show subjects the user has chosen during onboarding */}
                {subjects.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="topic" className="text-right">Topic (optional)</Label>
            <Input
              id="topic"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="col-span-4">
            <TimeSelector
              date={date}
              startTime={startTime}
              duration={duration}
              onDateChange={setDate}
              onStartTimeChange={setStartTime}
              onDurationChange={setDuration}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleEditSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditStudySessionDialog;
