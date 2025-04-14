
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CompletionReviewPanel from './CompletionReviewPanel';
import { FeedbackSummary } from '@/types/athro';
import athroService from '@/services/athroService';

interface CompletionReviewExampleProps {
  subject: string;
}

const CompletionReviewExample: React.FC<CompletionReviewExampleProps> = ({ subject }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Example mock submission data
  const mockSubmission = {
    id: 'mock-activity-1',
    title: `${subject} Practice Activity`,
    activityType: 'quiz',
    subject,
    score: 85,
    submittedAt: new Date().toISOString()
  };
  
  // Get feedback summary and add required properties
  const basicFeedback = athroService.getFeedbackSummary(mockSubmission);
  const feedbackSummary: FeedbackSummary = {
    ...basicFeedback,
    feedback: `Good work on your ${subject} practice!`,
    encouragement: 'Keep up the consistent effort!',
    activityType: 'quiz',
    activityId: mockSubmission.id,
    activityName: mockSubmission.title,
    subject: mockSubmission.subject
  };
  
  const handleReviewSubmission = () => {
    console.log('Review submission clicked');
    // This would typically open a detailed view of the submission
    alert('This would show your detailed submission');
  };
  
  const handleStartNewSession = () => {
    console.log('Start new session clicked');
    setIsOpen(false);
    // This would typically navigate to start a new activity
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">View Example Completion Review</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Completion Review</DialogTitle>
        </DialogHeader>
        <CompletionReviewPanel
          feedbackSummary={feedbackSummary}
          onReviewSubmission={handleReviewSubmission}
          onStartNewSession={handleStartNewSession}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CompletionReviewExample;
