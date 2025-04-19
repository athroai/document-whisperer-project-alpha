
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addMinutes } from 'date-fns';
import { useSubjects } from '@/hooks/useSubjects';
import { CalendarEvent, useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useToast } from '@/hooks/use-toast';

interface CreateStudySessionProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  initialTime?: string;
  onSuccess?: (event: CalendarEvent) => void;
}

const CreateStudySession = ({
  isOpen,
  onClose,
  initialDate = new Date(),
  initialTime = '15:00',
  onSuccess
}: CreateStudySessionProps) => {
  const [title, setTitle] = useState('Study Session');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(format(initialDate, 'yyyy-MM-dd'));
  const [time, setTime] = useState(initialTime);
  const [duration, setDuration] = useState('60');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { subjects } = useSubjects();
  const { createEvent } = useCalendarEvents();
  const { toast } = useToast();
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      if (!subject) {
        toast({
          title: "Subject Required",
          description: "Please select a subject for this study session",
          variant: "destructive"
        });
        return;
      }
      
      // Create start time
      const startTime = new Date(`${date}T${time}`);
      
      // Calculate end time
      const durationMinutes = parseInt(duration, 10);
      const endTime = addMinutes(startTime, durationMinutes);
      
      // Create event - with fallback for database errors
      const event = await createEvent({
        title: title || `${subject} Study Session`,
        subject,
        topic,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        event_type: 'study_session'
      }, true); // Added a parameter to indicate this is user-initiated and should use fallbacks
      
      if (event && onSuccess) {
        onSuccess(event);
      }
      
      // Close dialog
      onClose();
      
      // Reset form
      setTitle('Study Session');
      setSubject('');
      setTopic('');
      
    } catch (error) {
      console.error('Error creating study session:', error);
      
      // Show more descriptive error for permission issues
      if (error instanceof Error && error.message.includes('policy')) {
        toast({
          title: "Permission Error",
          description: "Unable to save to database. Your session will be saved locally only.",
          variant: "destructive"
        });
        
        // Try to create a local-only event
        try {
          const startTime = new Date(`${date}T${time}`);
          const durationMinutes = parseInt(duration, 10);
          const endTime = addMinutes(startTime, durationMinutes);
          
          const localEvent: CalendarEvent = {
            id: `local-${Date.now()}`,
            title: title || `${subject} Study Session`,
            subject: subject,
            topic: topic,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            event_type: 'study_session',
            local_only: true
          };
          
          if (onSuccess) {
            onSuccess(localEvent);
          }
          
          // Close dialog
          onClose();
        } catch (localError) {
          console.error('Error creating local event:', localError);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to create study session. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule a Study Session</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
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
              value={topic} 
              onChange={(e) => setTopic(e.target.value)} 
              className="col-span-3" 
              placeholder="Optional topic" 
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Date</Label>
            <Input 
              id="date" 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="col-span-3" 
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">Time</Label>
            <Input 
              id="time" 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
              className="col-span-3" 
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger id="duration" className="col-span-3">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStudySession;
