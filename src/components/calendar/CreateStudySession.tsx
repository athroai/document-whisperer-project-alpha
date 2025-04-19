
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addMinutes, parse } from 'date-fns';
import { useSubjects } from '@/hooks/useSubjects';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarEvent } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Clock } from 'lucide-react';

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
  const [hour, setHour] = useState(15);
  const [minute, setMinute] = useState(0);
  const [duration, setDuration] = useState('60');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Format time as HH:MM for display
  const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  
  const { subjects } = useSubjects();
  const { createEvent } = useCalendarEvents();
  const { toast } = useToast();
  
  // Update date and time when initialDate or initialTime changes
  useEffect(() => {
    if (initialDate) {
      setDate(format(initialDate, 'yyyy-MM-dd'));
    }
    
    if (initialTime) {
      try {
        const parsedTime = parse(initialTime, 'HH:mm', new Date());
        setHour(parsedTime.getHours());
        setMinute(parsedTime.getMinutes());
      } catch (error) {
        console.error('Error parsing initial time:', error);
        setHour(15);
        setMinute(0);
      }
    }
  }, [initialDate, initialTime]);
  
  // Handle hour slider change
  const handleHourChange = (value: number[]) => {
    setHour(value[0]);
  };
  
  // Handle minute slider change
  const handleMinuteChange = (value: number[]) => {
    setMinute(value[0]);
  };
  
  // Reset form
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
      
      // Create start time
      const startTime = new Date(`${date}T${timeString}`);
      
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
      
      // Reset form
      resetForm();
      
      // Close dialog
      onClose();
      
      // Call success callback with the new event
      if (event && onSuccess) {
        onSuccess(event);
      }
      
    } catch (error) {
      console.error('Error creating study session:', error);
      
      toast({
        title: "Error",
        description: "Failed to create study session. Session will be saved locally.",
        variant: "destructive"
      });
      
      // Try to create a local-only event
      try {
        const startTime = new Date(`${date}T${timeString}`);
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
        
        // Reset form
        resetForm();
        
        // Close dialog
        onClose();
        
        // Call success callback with the local event
        if (onSuccess) {
          onSuccess(localEvent);
        }
      } catch (localError) {
        console.error('Error creating local event:', localError);
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
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Time</Label>
            <div className="col-span-3 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm text-gray-500">Hour: {hour}</Label>
                  <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-sm">
                    <Clock className="h-3 w-3 mr-1 text-gray-500" />
                    <span>{timeString}</span>
                  </div>
                </div>
                <Slider
                  id="hour-slider"
                  value={[hour]}
                  min={0}
                  max={23}
                  step={1}
                  onValueChange={handleHourChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm text-gray-500">Minute: {minute}</Label>
                <Slider
                  id="minute-slider"
                  value={[minute]}
                  min={0}
                  max={55}
                  step={5}
                  onValueChange={handleMinuteChange}
                />
              </div>
            </div>
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
