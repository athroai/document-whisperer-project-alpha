
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { ConfidenceChange } from '@/hooks/useSessionFeedback';

interface SessionFeedbackFormProps {
  confidenceChange: ConfidenceChange;
  setConfidenceChange: (value: ConfidenceChange) => void;
  feedback: string;
  setFeedback: (value: string) => void;
  sessionSummary: string;
}

const SessionFeedbackForm: React.FC<SessionFeedbackFormProps> = ({
  confidenceChange,
  setConfidenceChange,
  feedback,
  setFeedback,
  sessionSummary
}) => {
  return (
    <div className="space-y-6">
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
          onValueChange={(value) => setConfidenceChange(value as ConfidenceChange)}
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
    </div>
  );
};

export default SessionFeedbackForm;
