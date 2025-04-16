
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import SessionFeedbackForm from './SessionFeedbackForm';
import { useSessionFeedback } from '@/hooks/useSessionFeedback';
import { useSessionSubmission } from '@/hooks/useSessionSubmission';
import { useSessionTranscript } from '@/hooks/useSessionTranscript';
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
  // Use our custom hooks
  const {
    isEnding,
    confidenceChange,
    setConfidenceChange,
    feedback,
    setFeedback,
    sessionSummary,
    isGeneratingSummary,
    handleEndSession,
    handleCancelFeedback,
    getConfidenceAfterValue
  } = useSessionFeedback({
    sessionId,
    subject,
    topic,
    messages,
    confidenceBefore,
    onSessionEnd
  });

  const { handleSubmitFeedback } = useSessionSubmission({
    sessionId,
    subject,
    topic,
    messages,
    confidenceBefore,
    onSessionEnd
  });

  // Use our transcript hook
  useSessionTranscript({ sessionId, messages });

  // Handle form submission
  const onSubmitFeedback = () => {
    const confidenceAfter = getConfidenceAfterValue();
    handleSubmitFeedback(confidenceAfter, feedback, sessionSummary);
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

      <Dialog open={isEnding} onOpenChange={handleCancelFeedback}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Session Feedback</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {isGeneratingSummary ? (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-8 h-8 border-4 border-t-transparent border-purple-600 rounded-full animate-spin mb-2"></div>
                <p className="text-sm text-gray-500">Generating session summary...</p>
              </div>
            ) : (
              <SessionFeedbackForm 
                confidenceChange={confidenceChange}
                setConfidenceChange={setConfidenceChange}
                feedback={feedback}
                setFeedback={setFeedback}
                sessionSummary={sessionSummary}
              />
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCancelFeedback}
              disabled={isGeneratingSummary}
            >
              Cancel
            </Button>
            <Button 
              onClick={onSubmitFeedback}
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
