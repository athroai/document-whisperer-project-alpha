
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { athroCharacters } from '@/config/athrosConfig';
import { useSubjects } from '@/hooks/useSubjects';
import { useStudySessionForm } from '@/hooks/calendar/useStudySessionForm';
import TimeSelector from './TimeSelector';

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
  const { formData, setters } = useStudySessionForm(selectedDate);
  const { subjects, isLoading } = useSubjects();
  const { toast } = useToast();
  
  const getTopicsForSubject = (subj: string) => {
    const character = athroCharacters.find(char => char.subject.toLowerCase() === subj.toLowerCase());
    return character ? character.topics : [];
  };
  
  const currentTopics = getTopicsForSubject(formData.subject);
  const availableSubjects = subjects.length > 0 ? subjects : athroCharacters.map(char => char.subject);

  const handleSubmit = async () => {
    try {
      setters.setIsSubmitting(true);
      
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const durationMinutes = parseInt(formData.duration, 10);
      const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);
      
      const hour = startDateTime.getHours();
      if (hour < 15 || hour > 23) {
        toast({
          title: "Invalid Time",
          description: "Please select a time between 3 PM and 11 PM",
          variant: "destructive",
        });
        setters.setIsSubmitting(false);
        return;
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: user.id,
          title: formData.title || `Study: ${formData.subject}${formData.topic ? ` - ${formData.topic}` : ''}`,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          event_type: 'study_session',
          subject: formData.subject,
          topic: formData.topic || null,
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
      
      setters.setTitle('');
      setters.setTopic('');
      
    } catch (error) {
      console.error('Error creating study session:', error);
      toast({
        title: 'Error',
        description: 'There was a problem scheduling your study session.',
        variant: 'destructive',
      });
    } finally {
      setters.setIsSubmitting(false);
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
              placeholder={`Study: ${formData.subject}${formData.topic ? ` - ${formData.topic}` : ''}`}
              value={formData.title}
              onChange={(e) => setters.setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select 
              value={formData.subject} 
              onValueChange={setters.setSubject}
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
              value={formData.topic} 
              onValueChange={setters.setTopic}
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
            date={formData.date}
            startTime={formData.startTime}
            duration={formData.duration}
            onDateChange={setters.setDate}
            onStartTimeChange={setters.setStartTime}
            onDurationChange={setters.setDuration}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={formData.isSubmitting}
          >
            {formData.isSubmitting ? 'Scheduling...' : 'Schedule Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudySessionDialog;
