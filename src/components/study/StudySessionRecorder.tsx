import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AthroMessage } from '@/types/athro';
import { getOpenAIResponse } from '@/lib/openai';
import { addDays, startOfDay } from 'date-fns';

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
  const [confidenceChange, setConfidenceChange] = useState<string>("slightly_better");
  const [feedback, setFeedback] = useState('');
  const [sessionSummary, setSessionSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
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
    
    if (messages.length > 0) {
      await generateSessionSummary();
    }
  };
  
  const generateSessionSummary = async () => {
    if (messages.length === 0) return;
    
    setIsGeneratingSummary(true);
    
    try {
      // Create a transcript from the messages for the AI to summarize
      const chatLogText = messages
        .map(msg => `${msg.senderId === 'user' ? 'Student' : 'Athro'}: ${msg.content}`)
        .join('\n\n');
      
      // Create a prompt for the AI to generate a summary
      const summaryPrompt = `
You are an educational assessment AI. Below is a transcript from a study session about ${subject}${topic ? ` on ${topic}` : ''}.

Summarize this study session in 3 bullet points. Highlight what was covered, what the student struggled with (if apparent), and what they understood well.

Transcript:
${chatLogText}

Format your response as 3 concise bullet points.`;

      // Get summary from OpenAI
      const summary = await getOpenAIResponse({
        systemPrompt: "You are an educational assessment AI that provides short, concise summaries of study sessions.",
        userMessage: summaryPrompt,
      });
      
      setSessionSummary(summary || "Unable to generate summary.");
    } catch (error) {
      console.error('Error generating session summary:', error);
      setSessionSummary("Unable to generate session summary due to an error.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Map confidence change selection to numeric value
  const getConfidenceAfterValue = (): number => {
    if (!confidenceBefore) return 5; // Default if no prior confidence
    
    switch (confidenceChange) {
      case 'much_better':
        return Math.min(confidenceBefore + 3, 10);
      case 'slightly_better':
        return Math.min(confidenceBefore + 1, 10);
      case 'no_change':
        return confidenceBefore;
      case 'still_unsure':
        return Math.max(confidenceBefore - 1, 1);
      default:
        return confidenceBefore;
    }
  };

  const handleSubmitFeedback = async () => {
    const confidenceAfter = getConfidenceAfterValue();
    const needsReview = confidenceAfter < 5; // Tag for review if confidence is still low
    
    try {
      // Update study session record
      const sessionUpdateData = {
        end_time: new Date().toISOString(),
        confidence_after: confidenceAfter,
        notes: feedback,
        summary: sessionSummary,
        needs_review: needsReview,
        status: 'completed'
      };

      // Determine the original session's duration
      const originalSessionDuration = messages.length > 1 
        ? Math.round((new Date(messages[messages.length - 1].timestamp).getTime() - 
                      new Date(messages[0].timestamp).getTime()) / 60000) 
        : 50; // Default to 50 minutes if can't calculate

      // If confidence is low, schedule a review session
      if (needsReview && topic) {
        await scheduleReviewSession(subject, topic, originalSessionDuration);
      }

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
              summary: sessionSummary,
              needs_review: needsReview,
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
              summary: sessionSummary,
              needs_review: needsReview,
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

    } catch (error) {
      console.error('Error submitting feedback and scheduling review:', error);
      toast({
        title: "Error",
        description: "There was a problem saving your session and scheduling a review.",
        variant: "destructive",
      });
    }
  };

  const scheduleReviewSession = async (subject: string, topic: string, duration: number) => {
    try {
      // Find an open slot within the next 5 days
      const startDate = startOfDay(new Date());
      const endDate = addDays(startDate, 5);

      // First, get the user's availability blocks
      const { data: availabilityBlocks, error: availError } = await supabase
        .from('availability_blocks')
        .select('*')
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString());

      if (availError) throw availError;

      // Get existing calendar events in this period
      const { data: existingEvents, error: eventError } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString());

      if (eventError) throw eventError;

      // Simple slot finding logic (can be made more sophisticated later)
      const potentialSlots = availabilityBlocks.filter(block => 
        !existingEvents.some(event => 
          new Date(event.start_time) >= new Date(block.start_time) && 
          new Date(event.start_time) < new Date(block.end_time)
        )
      );

      if (potentialSlots.length === 0) {
        // No suitable slot found, log or handle accordingly
        console.log('No suitable slot found for review session');
        return;
      }

      // Select the first available slot
      const selectedSlot = potentialSlots[0];
      const startTime = new Date(selectedSlot.start_time);
      const endTime = new Date(startTime.getTime() + duration * 60000); // Convert duration to milliseconds

      // Insert review session event
      const { data: reviewSessionData, error: insertError } = await supabase
        .from('calendar_events')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          event_type: 'review_session',
          subject,
          title: `Review Session: ${topic}`,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          source_session_id: sessionId, // Link back to original session
          suggested: true
        });

      if (insertError) throw insertError;

      toast({
        title: "Review Session Scheduled",
        description: `A review session for ${topic} has been suggested in your calendar.`,
      });

    } catch (error) {
      console.error('Error scheduling review session:', error);
      toast({
        title: "Review Session Error",
        description: "Could not schedule a review session at this time.",
        variant: "destructive",
      });
    }
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
          
          <div className="py-4 space-y-6">
            {isGeneratingSummary ? (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-8 h-8 border-4 border-t-transparent border-purple-600 rounded-full animate-spin mb-2"></div>
                <p className="text-sm text-gray-500">Generating session summary...</p>
              </div>
            ) : (
              <>
                {sessionSummary && (
                  <div className="space-y-2 bg-gray-50 p-3 rounded-md">
                    <Label className="font-medium">Session Summary:</Label>
                    <div className="text-sm whitespace-pre-line">{sessionSummary}</div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <Label htmlFor="confidence" className="font-medium">How do you feel about this topic now?</Label>
                  <RadioGroup 
                    value={confidenceChange}
                    onValueChange={setConfidenceChange}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="much_better" id="much_better" />
                      <Label htmlFor="much_better" className="font-normal">Much better - I understand it well now</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="slightly_better" id="slightly_better" />
                      <Label htmlFor="slightly_better" className="font-normal">Slightly better - I'm making progress</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no_change" id="no_change" />
                      <Label htmlFor="no_change" className="font-normal">No change - About the same as before</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="still_unsure" id="still_unsure" />
                      <Label htmlFor="still_unsure" className="font-normal">Still unsure - I need more help with this</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="feedback" className="font-medium">Feedback or Notes (Optional)</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Share your thoughts about this study session..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEnding(false)}
              disabled={isGeneratingSummary}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitFeedback}
              disabled={isGeneratingSummary}
            >
              Submit & End Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudySessionRecorder;
