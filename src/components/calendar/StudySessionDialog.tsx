
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { athroCharacters } from '@/config/athrosConfig';

interface StudySessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onSuccess?: () => void;
}

const StudySessionDialog: React.FC<StudySessionDialogProps> = ({
  open,
  onOpenChange,
  selectedDate,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('16:00');
  const [duration, setDuration] = useState('30');
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  
  // Get topics for selected subject
  const getTopicsForSubject = (subj: string) => {
    const char = Object.entries(athroCharacters).find(([key]) => key === subj);
    return char ? char[1].topics : [];
  };
  
  const currentTopics = getTopicsForSubject(subject);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Format date and time
      const startDateTime = new Date(`${date}T${startTime}`);
      const durationMinutes = parseInt(duration, 10);
      const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);
      
      // Create session description with subject and topic info
      const sessionDescription = JSON.stringify({
        subject: subject,
        topic: topic || undefined,
        description: `Study session for ${subject}${topic ? ` on ${topic}` : ''}.`
      });
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Create calendar event
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          title: title || `Study: ${subject}${topic ? ` - ${topic}` : ''}`,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          event_type: 'study_session',
          description: sessionDescription,
          student_id: user.id
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: 'Study Session Scheduled',
        description: 'Your study session has been added to your calendar.',
      });
      
      if (onSuccess) onSuccess();
      onOpenChange(false);
      
      // Reset form
      setTitle('');
      setTopic('');
      
    } catch (error) {
      console.error('Error creating study session:', error);
      toast({
        title: 'Error',
        description: 'There was a problem scheduling your study session.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Study Session</DialogTitle>
          <DialogDescription>
            Create a new study session with your Athro mentor
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Session Title (Optional)</Label>
            <Input 
              id="title" 
              placeholder={`Study: ${subject}${topic ? ` - ${topic}` : ''}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select 
              value={subject} 
              onValueChange={setSubject}
            >
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(athroCharacters).map((subj) => (
                  <SelectItem key={subj} value={subj}>
                    {subj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic">Topic (Optional)</Label>
            <Select 
              value={topic} 
              onValueChange={setTopic}
            >
              <SelectTrigger id="topic">
                <SelectValue placeholder="Select Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Study</SelectItem>
                {currentTopics.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Start Time</Label>
              <Input 
                id="time" 
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Select 
              value={duration} 
              onValueChange={setDuration}
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="90">90 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudySessionDialog;
