
import React, { useState, useMemo } from 'react';
import { StudySession } from '@/types/study';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
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

interface StudySessionListProps {
  sessions: StudySession[];
  loading?: boolean;
  groupBySubject?: boolean;
  confidenceFilter?: 'all' | 'unsure';
  subjectFilter?: string;
  onScheduleReview?: (subject: string, topic: string | undefined, sessionId?: string) => void;
}

export const StudySessionList: React.FC<StudySessionListProps> = ({ 
  sessions, 
  loading,
  groupBySubject = false,
  confidenceFilter = 'all',
  subjectFilter = 'all',
  onScheduleReview
}) => {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const filteredSessions = useMemo(() => {
    let result = [...sessions];
    
    // Filter by confidence change
    if (confidenceFilter === 'unsure') {
      result = result.filter(session => {
        const confidenceChange = getConfidenceChange(session);
        return confidenceChange === "No change" || confidenceChange === "Needs more work";
      });
    }
    
    // Filter by subject
    if (subjectFilter !== 'all') {
      result = result.filter(session => session.subject === subjectFilter);
    }
    
    return result;
  }, [sessions, confidenceFilter, subjectFilter]);

  // Group sessions by subject if needed
  const groupedSessions = useMemo(() => {
    if (!groupBySubject) return null;
    
    const groups: Record<string, StudySession[]> = {};
    filteredSessions.forEach(session => {
      const subject = session.subject;
      if (!groups[subject]) {
        groups[subject] = [];
      }
      groups[subject].push(session);
    });
    
    return groups;
  }, [filteredSessions, groupBySubject]);

  const getConfidenceChange = (session: StudySession) => {
    if (!session.confidenceAfter || !session.confidenceBefore) {
      return null;
    }
    
    const beforeValue = session.confidenceBefore;
    const afterValue = session.confidenceAfter;
    
    if (afterValue === beforeValue) {
      return "No change";
    } else if (afterValue === "high" && beforeValue !== "high") {
      return "Greatly improved";
    } else if (afterValue === "medium" && beforeValue === "low") {
      return "Slightly improved";
    } else {
      return "Needs more work";
    }
  };
  
  const getConfidenceBadgeColor = (changeType: string | null) => {
    if (!changeType) return "bg-gray-100 text-gray-800";
    
    switch (changeType) {
      case "Greatly improved":
        return "bg-green-100 text-green-800";
      case "Slightly improved":
        return "bg-blue-100 text-blue-800";
      case "No change":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!sessions || filteredSessions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <p>No study sessions found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render subject-grouped sessions
  if (groupBySubject && groupedSessions) {
    return (
      <div className="space-y-8">
        {Object.entries(groupedSessions).map(([subject, subjectSessions]) => (
          <div key={subject}>
            <h2 className="text-xl font-bold mb-4">{subject}</h2>
            <div className="space-y-4">
              {subjectSessions.map(renderSession)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Render chronological list
  return (
    <div className="space-y-4">
      {filteredSessions.map(renderSession)}
    </div>
  );

  function renderSession(session: StudySession) {
    const isExpanded = expandedSession === session.id;
    const confidenceChange = getConfidenceChange(session);
    const badgeColor = getConfidenceBadgeColor(confidenceChange);
    
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
              <Badge className={badgeColor}>
                {confidenceChange}
              </Badge>
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
            onClick={() => setExpandedSession(isExpanded ? null : session.id)}
          >
            {isExpanded ? (
              <><ChevronUp className="h-4 w-4 mr-1" /> Show less</>
            ) : (
              <><ChevronDown className="h-4 w-4 mr-1" /> {session.topic ? `View details` : `Show more`}</>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }
};
