import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Submission, FeedbackData } from '@/types/assignment';
import { assignmentService } from '@/services/assignmentService';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from '@/components/ui/switch';

interface MarkingDetailsViewProps {
  submission: Submission;
  assignmentTitle: string;
  studentName: string;
  onSubmitFeedback: () => void;
}

const MarkingDetailsView: React.FC<MarkingDetailsViewProps> = ({
  submission,
  assignmentTitle,
  studentName,
  onSubmitFeedback
}) => {
  const { state } = useAuth();
  const { user } = state;
  const [useAIFeedback, setUseAIFeedback] = useState<boolean>(!!submission.aiFeedback);
  const [rating, setRating] = useState<"needs_improvement" | "good" | "excellent">("good");
  const [feedback, setFeedback] = useState<string>(submission.teacherFeedback?.comment || "");
  const [score, setScore] = useState<number>(submission.teacherFeedback?.score || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!user?.id) return;
    
    setIsSubmitting(true);
    try {
      const feedbackData: FeedbackData = {
        score,
        outOf: 10, // Default scale
        comment: feedback,
        markedBy: user.id,
        markedAt: new Date().toISOString(),
        rating
      };
      
      await assignmentService.markSubmission(submission.id, feedbackData);
      toast({
        title: "Feedback submitted",
        description: "The student will be notified of your feedback."
      });
      onSubmitFeedback();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render student answer based on assignment type
  const renderStudentAnswer = () => {
    // Handle OpenAnswer type (text)
    if ('text' in submission.answers) {
      return (
        <div className="whitespace-pre-wrap p-4 border rounded-md bg-gray-50">
          {submission.answers.text}
        </div>
      );
    } 
    // Handle FileUploadAnswer type (files)
    else if (
      typeof submission.answers === 'object' && 
      !Array.isArray(submission.answers) &&
      'fileUrls' in submission.answers && 
      'fileNames' in submission.answers &&
      Array.isArray(submission.answers.fileUrls) && 
      Array.isArray(submission.answers.fileNames)
    ) {
      return (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Files submitted:</p>
          <ul className="list-disc pl-5">
            {submission.answers.fileNames.map((name, index) => (
              <li key={index}>
                <a 
                  href={submission.answers.fileUrls[index]} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
    } 
    // Handle QuizAnswer type (array of answers)
    else if (Array.isArray(submission.answers)) {
      return (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Quiz Responses:</p>
          <ul className="space-y-2">
            {submission.answers.map((answer, index) => (
              <li key={index} className="p-2 border rounded-md">
                <p className="font-medium">Question {index + 1}</p>
                <p>Answer: {answer.userAnswer}</p>
                {answer.isCorrect !== undefined && (
                  <p className={`text-sm ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {answer.isCorrect ? 'Correct' : 'Incorrect'}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    
    // Fallback for unrecognized answer format
    return (
      <div className="p-4 border rounded-md bg-gray-50">
        <p className="text-sm text-muted-foreground">Unable to display answer format.</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">{assignmentTitle}</h2>
          <p className="text-gray-500">Submitted by: {studentName}</p>
        </div>
        <p className="text-sm text-gray-500">
          Submitted on: {new Date(submission.submittedAt).toLocaleDateString()}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Student Answer</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStudentAnswer()}
        </CardContent>
      </Card>

      {submission.aiFeedback && (
        <Card className="border-purple-200">
          <CardHeader className="bg-purple-50 border-b border-purple-200">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg text-purple-800">AI Feedback</CardTitle>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="use-ai-feedback" 
                  checked={useAIFeedback} 
                  onCheckedChange={setUseAIFeedback}
                />
                <Label htmlFor="use-ai-feedback" className="text-sm text-purple-800">Use AI Feedback</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div>
              <p className="mb-2"><strong>Score:</strong> {submission.aiFeedback.score}/10</p>
              <p className="whitespace-pre-wrap">{submission.aiFeedback.comment}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="rating">Rating</Label>
            <RadioGroup 
              id="rating" 
              className="flex space-x-4 mt-2" 
              value={rating} 
              onValueChange={(value) => setRating(value as any)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="needs_improvement" id="needs_improvement" />
                <Label htmlFor="needs_improvement">Needs Improvement</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" id="good" />
                <Label htmlFor="good">Good</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excellent" id="excellent" />
                <Label htmlFor="excellent">Excellent</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="score">Score (out of 10)</Label>
            <input
              id="score"
              type="number"
              min="0"
              max="10"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-24 mt-1 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <Label htmlFor="feedback">Comment</Label>
            <Textarea
              id="feedback"
              placeholder="Provide detailed feedback to the student..."
              rows={6}
              value={useAIFeedback && submission.aiFeedback ? submission.aiFeedback.comment : feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={useAIFeedback && !!submission.aiFeedback}
              className={useAIFeedback && submission.aiFeedback ? "bg-gray-50" : ""}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <Button onClick={handleSubmitFeedback} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Send Feedback"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MarkingDetailsView;
