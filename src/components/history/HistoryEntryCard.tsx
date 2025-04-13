
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Book, Award, MessageSquare, ChevronRight } from "lucide-react";
import { HistoryEntry } from '@/types/history';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CompletionReviewPanel from '../feedback/CompletionReviewPanel';
import { FeedbackSummary } from '@/types/feedback';

interface HistoryEntryCardProps {
  entry: HistoryEntry;
  onReview?: (entryId: string) => void;
}

const HistoryEntryCard: React.FC<HistoryEntryCardProps> = ({ entry, onReview }) => {
  const [isReviewOpen, setIsReviewOpen] = React.useState(false);

  const getTypeIcon = () => {
    switch (entry.type) {
      case 'goal':
        return <Award className="h-5 w-5 text-purple-600" />;
      case 'assignment':
        return <Book className="h-5 w-5 text-blue-600" />;
      case 'quiz':
        return <Award className="h-5 w-5 text-green-600" />;
      case 'session':
        return <MessageSquare className="h-5 w-5 text-amber-600" />;
      default:
        return <Book className="h-5 w-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (entry.type) {
      case 'goal':
        return 'Study Goal';
      case 'assignment':
        return 'Assignment';
      case 'quiz':
        return 'Quiz';
      case 'session':
        return 'Study Session';
      default:
        return 'Activity';
    }
  };

  const getScoreBadge = () => {
    if (entry.score === undefined) return null;

    let color = 'bg-gray-100 text-gray-800';
    if (entry.score >= 90) color = 'bg-green-100 text-green-800';
    else if (entry.score >= 80) color = 'bg-emerald-100 text-emerald-800';
    else if (entry.score >= 70) color = 'bg-blue-100 text-blue-800';
    else if (entry.score >= 60) color = 'bg-amber-100 text-amber-800';
    else color = 'bg-red-100 text-red-800';

    return (
      <Badge className={color} variant="outline">
        {entry.score}%
      </Badge>
    );
  };

  const handleReview = () => {
    if (onReview) {
      onReview(entry.id);
    } else {
      setIsReviewOpen(true);
    }
  };

  // Convert the history entry to a feedback summary for the review panel
  const getFeedbackSummary = (): FeedbackSummary => {
    return {
      score: entry.score || 0,
      feedback: entry.feedback || "No detailed feedback available.",
      encouragement: entry.encouragement || "Keep up the good work!",
      activityType: entry.type === 'assignment' ? 'assignment' : 
                   entry.type === 'quiz' ? 'quiz' : 
                   entry.type === 'goal' ? 'goal' : 'exam',
      activityId: entry.activityId || entry.id,
      activityName: entry.activityName || `${entry.subject} ${entry.topic || ''}`,
      subject: entry.subject,
      submittedAt: entry.dateCompleted
    };
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {getTypeIcon()}
            <span className="font-medium">{getTypeLabel()}: {entry.activityName || entry.topic}</span>
          </div>
          {getScoreBadge()}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Book className="h-4 w-4 mr-1" />
            <span>{entry.subject}</span>
            {entry.topic && <span> • {entry.topic}</span>}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{format(new Date(entry.dateCompleted), 'PPP')}</span>
          </div>
          {entry.feedback && (
            <p className="text-sm line-clamp-2 text-gray-700">
              {entry.feedback}
            </p>
          )}
          {entry.encouragement && (
            <p className="text-sm italic line-clamp-1 text-purple-700">
              "{entry.encouragement}"
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full" onClick={handleReview}>
              Review <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{entry.activityName || `${entry.subject} ${entry.topic || ''}`}</DialogTitle>
            </DialogHeader>
            <CompletionReviewPanel 
              feedbackSummary={getFeedbackSummary()} 
              showNavigationButtons={false}
            />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default HistoryEntryCard;
