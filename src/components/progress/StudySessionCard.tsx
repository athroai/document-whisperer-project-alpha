
import React from 'react';
import { StudySession } from '@/types/study';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  Clock, 
  Calendar, 
  ChevronDown, 
  ChevronUp,
  FileText, 
  ThumbsUp, 
  ThumbsDown,
  Bookmark,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudySessionCardProps {
  session: StudySession;
  isExpanded: boolean;
  onExpand: (id: string | null) => void;
  onScheduleReview?: (subject: string, topic: string | undefined, sessionId?: string) => void;
  confidenceChange: string | null;
}

export const StudySessionCard: React.FC<StudySessionCardProps> = ({
  session,
  isExpanded,
  onExpand,
  onScheduleReview,
  confidenceChange
}) => {
  const badgeColor = (() => {
    if (!confidenceChange) return "bg-gray-100 text-gray-800";
    switch (confidenceChange) {
      case "Greatly improved":
        return "bg-green-100 text-green-800";
      case "Slightly improved":
        return "bg-blue-100 text-blue-800";
      case "No change":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  })();

  return (
    <Card key={session.id} className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{session.subject}</CardTitle>
            {session.topic && (
              <CardDescription className="mt-1">
                Topic: {session.topic}
              </CardDescription>
            )}
          </div>
          {confidenceChange && (
            <Badge className={badgeColor}>{confidenceChange}</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            {format(new Date(session.startTime), 'PPP')}
          </div>

          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            {format(new Date(session.startTime), 'p')} - {format(new Date(session.endTime), 'p')}
          </div>

          {session.duration && (
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              {session.duration} minutes
            </div>
          )}
        </div>
        {isExpanded && (
          <div className="space-y-4 mt-4 border-t pt-4">
            {session.confidenceBefore && (
              <div className="flex items-center gap-2">
                <ThumbsDown className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Confidence before: </span>
                <span className="text-sm">{session.confidenceBefore}</span>
              </div>
            )}

            {session.confidenceAfter && (
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Confidence after: </span>
                <span className="text-sm">{session.confidenceAfter}</span>
              </div>
            )}

            {session.notes && (
              <div>
                <div className="text-sm font-medium flex items-center gap-1 mb-1">
                  <FileText className="h-4 w-4" /> Notes:
                </div>
                <div className="text-sm bg-gray-50 p-3 rounded-md">
                  {session.notes}
                </div>
              </div>
            )}

            {session.summary && (
              <div>
                <div className="text-sm font-medium flex items-center gap-1 mb-1">
                  <Bookmark className="h-4 w-4" /> Summary:
                </div>
                <div className="text-sm bg-gray-50 p-3 rounded-md">
                  {session.summary}
                </div>
              </div>
            )}

            {onScheduleReview && session.topic && (
              <Button
                onClick={() => onScheduleReview(session.subject, session.topic, session.id)}
                variant="outline"
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Schedule Review
              </Button>
            )}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-gray-500"
          onClick={() => onExpand(isExpanded ? null : session.id)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" /> {session.topic ? `View details` : `Show more`}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
