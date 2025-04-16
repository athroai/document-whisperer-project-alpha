
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AthroSubject } from '@/types/athro';

interface CalendarStudyEvent {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  start_time: string;
  end_time: string;
  description?: string;
  materials?: {
    id: string;
    name: string;
    url: string;
  }[];
}

export const StudySessionLauncher: React.FC = () => {
  const [upcomingSession, setUpcomingSession] = useState<CalendarStudyEvent | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [checkingTime] = useState<number>(60000); // Check every minute
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkForUpcomingSessions = async () => {
    try {
      const user = supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const fiveMinutesLater = new Date(now.getTime() + 5 * 60000);
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
      
      // Query calendar events that are about to start or just started
      const { data, error } = await supabase
        .from('calendar_events')
        .select('id, title, description, start_time, end_time, student_id, event_type')
        .eq('event_type', 'study_session')
        .gte('start_time', fiveMinutesAgo.toISOString())
        .lte('start_time', fiveMinutesLater.toISOString())
        .order('start_time', { ascending: true })
        .limit(1);

      if (error) {
        console.error('Error fetching upcoming sessions:', error);
        return;
      }

      if (data && data.length > 0) {
        // Format the event for our component
        const event = data[0];
        const eventDetails = event.description ? JSON.parse(event.description) : {};
        
        setUpcomingSession({
          id: event.id,
          title: event.title,
          subject: eventDetails.subject || 'General',
          topic: eventDetails.topic,
          start_time: event.start_time,
          end_time: event.end_time,
          description: eventDetails.description,
          materials: eventDetails.materials || []
        });
        
        setShowDialog(true);
      }
    } catch (error) {
      console.error('Error in checking for upcoming sessions:', error);
    }
  };

  useEffect(() => {
    // Check for upcoming sessions when component mounts
    checkForUpcomingSessions();
    
    // Set interval to check periodically
    const intervalId = setInterval(checkForUpcomingSessions, checkingTime);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [checkingTime]);

  const handleStartSession = () => {
    if (!upcomingSession) return;
    
    // Log session start in database
    logSessionStart(upcomingSession.id);
    
    // Navigate to study session with relevant parameters
    navigate(`/study?subject=${upcomingSession.subject}&topic=${upcomingSession.topic || ''}&sessionId=${upcomingSession.id}`);
    
    setShowDialog(false);
  };

  const handleSkipSession = async () => {
    if (!upcomingSession) return;
    
    try {
      // Log that the session was skipped
      await supabase
        .from('study_sessions')
        .insert({
          id: upcomingSession.id,
          status: 'skipped',
          calendar_event_id: upcomingSession.id,
          subject: upcomingSession.subject,
          topic: upcomingSession.topic,
          start_time: new Date().toISOString()
        });
      
      toast({
        title: "Session Skipped",
        description: "Your study session has been marked as skipped.",
      });
    } catch (error) {
      console.error('Error logging skipped session:', error);
    }
    
    setShowDialog(false);
  };

  const handleRescheduleSession = () => {
    setShowDialog(false);
    navigate('/calendar');
    
    toast({
      title: "Reschedule Session",
      description: "Please reschedule your study session on the calendar.",
    });
  };

  const logSessionStart = async (sessionId: string) => {
    try {
      // Create or update a study session entry
      await supabase
        .from('study_sessions')
        .upsert({
          id: sessionId,
          status: 'in_progress',
          calendar_event_id: sessionId, 
          subject: upcomingSession?.subject,
          topic: upcomingSession?.topic,
          start_time: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging session start:', error);
    }
  };

  // Time formatting helper
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Study Session Starting</DialogTitle>
          <DialogDescription>
            Your scheduled {upcomingSession?.subject} study session is about to begin.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-2">
            <p><span className="font-medium">Session:</span> {upcomingSession?.title}</p>
            <p><span className="font-medium">Subject:</span> {upcomingSession?.subject}</p>
            {upcomingSession?.topic && (
              <p><span className="font-medium">Topic:</span> {upcomingSession.topic}</p>
            )}
            <p><span className="font-medium">Time:</span> {upcomingSession && formatTime(upcomingSession.start_time)} - {upcomingSession && formatTime(upcomingSession.end_time)}</p>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row sm:justify-center gap-2">
          <Button onClick={handleStartSession} variant="default">
            Start Now
          </Button>
          <Button onClick={handleRescheduleSession} variant="outline">
            Reschedule
          </Button>
          <Button onClick={handleSkipSession} variant="ghost">
            Skip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudySessionLauncher;
