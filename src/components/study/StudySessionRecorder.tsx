
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AthroMessage } from '@/types/athro';

interface StudySessionRecorderProps {
  sessionId?: string;
  subject: string;
  topic?: string;
  messages: AthroMessage[];
  confidenceBefore?: number;
  onSessionEnd: () => void;
}

const StudySessionRecorder: React.FC<StudySessionRecorderProps> = ({
  sessionId,
  subject,
  topic,
  messages,
  confidenceBefore,
  onSessionEnd
}) => {
  const [isEnding, setIsEnding] = useState(false);
  const [confidenceAfter, setConfidenceAfter] = useState<number>(confidenceBefore || 5);
  const [feedback, setFeedback] = useState('');
  const { toast } = useToast();

  // Record transcript periodically when new messages come in
  useEffect(() => {
    if (!sessionId || messages.length === 0) return;
    
    const saveTranscript = async () => {
      try {
        const transcript = messages.map(msg => ({
          role: msg.senderId === 'user' ? 'user' : 'assistant',
          content: msg.content,
          timestamp: msg.timestamp
        }));

        await supabase
          .from('study_sessions')
          .update({ 
            transcript: JSON.stringify(transcript),
            last_updated: new Date().toISOString()
          })
          .eq('id', sessionId);
      } catch (error) {
        console.error('Error saving transcript:', error);
      }
    };

    // Debounce the save to avoid excessive database calls
    const timeoutId = setTimeout(saveTranscript, 2000);
    return () => clearTimeout(timeoutId);
  }, [sessionId, messages]);

  const handleEndSession = async () => {
    setIsEnding(true);
  };

  const handleSubmitFeedback = async () => {
    if (!sessionId) {
      // Create a new session record if this wasn't from a calendar event
      try {
        const { data: sessionData, error } = await supabase
          .from('study_sessions')
          .insert({
            subject,
            topic,
            start_time: new Date(messages[0]?.timestamp || new Date()).toISOString(),
            end_time: new Date().toISOString(),
            confidence_before: confidenceBefore,
            confidence_after: confidenceAfter,
            notes: feedback,
            status: 'completed',
            transcript: JSON.stringify(messages.map(msg => ({
              role: msg.senderId === 'user' ? 'user' : 'assistant',
              content: msg.content,
              timestamp: msg.timestamp
            })))
          })
          .select()
          .single();
          
        if (error) throw error;
        
        toast({
          title: "Session Completed",
          description: "Your study session has been saved.",
        });
      } catch (error) {
        console.error('Error recording session:', error);
        toast({
          title: "Error",
          description: "There was a problem saving your session.",
          variant: "destructive",
        });
      }
    } else {
      // Update existing session record
      try {
        await supabase
          .from('study_sessions')
          .update({
            end_time: new Date().toISOString(),
            confidence_after: confidenceAfter,
            notes: feedback,
            status: 'completed'
          })
          .eq('id', sessionId);
            
        toast({
          title: "Session Completed",
          description: "Your study session has been saved.",
        });
      } catch (error) {
        console.error('Error updating session record:', error);
        toast({
          title: "Error",
          description: "There was a problem updating your session.",
          variant: "destructive",
        });
      }
    }
    
    // Update user's confidence score for this subject
    try {
      const { data } = await supabase
        .from('profiles')
        .select('confidence_scores')
        .single();
      
      if (data) {
        const confidenceScores = data.confidence_scores || {};
        confidenceScores[subject] = confidenceAfter;
        
        await supabase
          .from('profiles')
          .update({ confidence_scores: confidenceScores })
          .eq('id', (await supabase.auth.getUser()).data.user?.id);
      }
    } catch (error) {
      console.error('Error updating confidence scores:', error);
    }
    
    setIsEnding(false);
    onSessionEnd();
  };

  return (
    <>
      <Button 
        onClick={handleEndSession}
        variant="outline"
        className="w-full justify-start"
      >
        End Session & Give Feedback
      </Button>

      <Dialog open={isEnding} onOpenChange={setIsEnding}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Session Feedback</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confidence">How confident do you feel about this topic now? (1-10)</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="confidence"
                  min={1}
                  max={10}
                  step={1}
                  value={[confidenceAfter]}
                  onValueChange={(values) => setConfidenceAfter(values[0])}
                  className="flex-grow"
                />
                <span className="w-8 text-center">{confidenceAfter}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feedback">Session Notes (Optional)</Label>
              <Textarea
                id="feedback"
                placeholder="Share your thoughts about this study session..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEnding(false)}>Cancel</Button>
            <Button onClick={handleSubmitFeedback}>Submit & End Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudySessionRecorder;
