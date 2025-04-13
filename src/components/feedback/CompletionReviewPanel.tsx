
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Star, FileText, ArrowRight, MessageSquare, Award } from 'lucide-react';
import { FeedbackSummary } from '@/types/feedback';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface CompletionReviewPanelProps {
  feedbackSummary: FeedbackSummary;
  onReviewSubmission?: () => void;
  onStartNewSession?: () => void;
  showNavigationButtons?: boolean;
}

const getScoreColor = (score: number): string => {
  if (score >= 90) return 'bg-green-500';
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
};

const getScoreBadge = (score: number): JSX.Element => {
  if (score >= 90) {
    return (
      <div className="flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full">
        <Award className="h-4 w-4" />
        <span className="text-sm font-medium">Excellent</span>
      </div>
    );
  }
  if (score >= 80) {
    return (
      <div className="flex items-center gap-1 text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
        <Star className="h-4 w-4" />
        <span className="text-sm font-medium">Very Good</span>
      </div>
    );
  }
  if (score >= 70) {
    return (
      <div className="flex items-center gap-1 text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
        <Star className="h-4 w-4" />
        <span className="text-sm font-medium">Good</span>
      </div>
    );
  }
  if (score >= 60) {
    return (
      <div className="flex items-center gap-1 text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
        <Star className="h-4 w-4" />
        <span className="text-sm font-medium">Satisfactory</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-red-700 bg-red-100 px-3 py-1 rounded-full">
      <Star className="h-4 w-4" />
      <span className="text-sm font-medium">Needs Improvement</span>
    </div>
  );
};

const getActivityTypeLabel = (type: 'goal' | 'assignment' | 'quiz' | 'exam'): string => {
  switch (type) {
    case 'goal':
      return 'Study Goal';
    case 'assignment':
      return 'Assignment';
    case 'quiz':
      return 'Quiz';
    case 'exam':
      return 'Mock Exam';
    default:
      return 'Activity';
  }
};

export const CompletionReviewPanel: React.FC<CompletionReviewPanelProps> = ({
  feedbackSummary,
  onReviewSubmission,
  onStartNewSession,
  showNavigationButtons = true
}) => {
  const navigate = useNavigate();

  const handleStartNewSession = () => {
    if (onStartNewSession) {
      onStartNewSession();
    } else {
      // Default behavior - navigate to the subject page
      const subjectRoute = feedbackSummary.subject.toLowerCase();
      navigate(`/athro/${subjectRoute}`);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {getActivityTypeLabel(feedbackSummary.activityType)} Feedback
            </p>
            <CardTitle className="text-xl">{feedbackSummary.activityName}</CardTitle>
          </div>
          {getScoreBadge(feedbackSummary.score)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Score</span>
            <span className="text-sm font-medium">{feedbackSummary.score}%</span>
          </div>
          <Progress 
            value={feedbackSummary.score} 
            className={`h-2 ${getScoreColor(feedbackSummary.score)}`} 
          />
        </div>
        
        <div className="space-y-4">
          {/* AI Feedback */}
          <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <h3 className="font-medium text-purple-800">Feedback</h3>
            </div>
            <p className="text-purple-900">{feedbackSummary.feedback}</p>
          </div>
          
          {/* Encouragement */}
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-800">Encouragement</h3>
            </div>
            <p className="text-blue-900">{feedbackSummary.encouragement}</p>
          </div>
          
          {/* Teacher Comments (if available) */}
          {feedbackSummary.teacherComments && (
            <div className="bg-green-50 p-4 rounded-md border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-green-800">Teacher Comments</h3>
              </div>
              <p className="text-green-900">{feedbackSummary.teacherComments}</p>
            </div>
          )}
        </div>
        
        {feedbackSummary.submittedAt && (
          <div className="text-sm text-gray-500 text-center">
            Completed on: {format(new Date(feedbackSummary.submittedAt), 'PPP')}
          </div>
        )}
      </CardContent>
      
      {showNavigationButtons && (
        <CardFooter className="flex justify-between gap-4">
          {onReviewSubmission && (
            <Button variant="outline" onClick={onReviewSubmission} className="flex-1">
              <FileText className="mr-2 h-4 w-4" />
              Review Submission
            </Button>
          )}
          <Button onClick={handleStartNewSession} className="flex-1">
            Start New Session
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CompletionReviewPanel;
