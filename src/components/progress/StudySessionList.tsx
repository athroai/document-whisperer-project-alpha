import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, RefreshCw, BookOpen, ArrowRight } from 'lucide-react';
import { formatDistance, format } from 'date-fns';
import { StudySession } from '@/types/study';
import { getConfidenceChange, getConfidenceColor } from '@/utils/confidenceUtils';
import { ConfidenceLabel } from '@/types/confidence';

interface StudySessionListProps {
  sessions: StudySession[];
  isLoading: boolean;
  groupBySubject: boolean;
  confidenceFilter: 'all' | 'unsure';
  subjectFilter: string;
  onScheduleReview: (subject: string, topic: string | undefined, sessionId?: string) => void;
}

const StudySessionList: React.FC<StudySessionListProps> = ({
  sessions,
  isLoading,
  groupBySubject,
  confidenceFilter,
  subjectFilter,
  onScheduleReview
}) => {
  // Apply filters
  const filteredSessions = sessions.filter(session => {
    // Filter by confidence
    if (confidenceFilter === 'unsure') {
      // Include "Still unsure" or "No change" sessions
      if (session.confidence_after && session.confidence_before) {
        const confidenceChange = getConfidenceChange(
          session.confidence_before as ConfidenceLabel,
          session.confidence_after as ConfidenceLabel
        );
        if (confidenceChange !== "Still unsure" && confidenceChange !== "No change") return false;
      }
    }
    
    // Filter by subject
    if (subjectFilter !== 'all' && session.subject !== subjectFilter) {
      return false;
    }
    
    return true;
  });
  
  // Group sessions by subject if requested
  const groupedSessions: [string, StudySession[]][] = groupBySubject 
    ? Object.entries(
        filteredSessions.reduce((acc: {[key: string]: StudySession[]}, session) => {
          const subject = session.subject || 'Other';
          if (!acc[subject]) acc[subject] = [];
          acc[subject].push(session);
          return acc;
        }, {})
      )
    : [['All', filteredSessions]];
  
  if (isLoading) {
    return (
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (filteredSessions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium">No study sessions found</h3>
            <p className="mt-1 text-gray-500">
              {confidenceFilter !== 'all' || subjectFilter !== 'all'
                ? "Try changing your filters to see more sessions"
                : "Once you complete some study sessions, they will appear here"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {groupedSessions.map(([subject, subjectSessions]) => (
        <div key={subject} className="space-y-4">
          {groupBySubject && (
            <div className="flex items-center">
              <h2 className="text-xl font-semibold">{subject}</h2>
              <Badge variant="outline" className="ml-2">
                {subjectSessions.length} {subjectSessions.length === 1 ? 'session' : 'sessions'}
              </Badge>
            </div>
          )}
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subjectSessions.map((session) => {
              const confidenceLabel = session.confidence_after && session.confidence_before
                ? getConfidenceChange(
                    session.confidence_before as ConfidenceLabel, 
                    session.confidence_after as ConfidenceLabel
                  )
                : "No change";
                
              const confidenceColor = getConfidenceColor(confidenceLabel);
              
              return (
                <Card key={session.id} className="flex flex-col h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base font-medium">
                          {session.topic || session.subject}
                        </CardTitle>
                        {session.topic && (
                          <CardDescription className="mt-1">{session.subject}</CardDescription>
                        )}
                      </div>
                      <Badge className={`${confidenceColor}`}>
                        {confidenceLabel}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center text-gray-500">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>{session.start_time ? format(new Date(session.start_time), 'PPP') : 'Unknown date'}</span>
                      </div>
                      
                      {session.duration_minutes && (
                        <div className="flex items-center text-gray-500">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>{session.duration_minutes} minutes</span>
                        </div>
                      )}
                      
                      <div className="flex items-center mt-2">
                        <span className="text-gray-600 font-medium">Confidence:</span>
                        <span className="mx-2">{session.confidence_before || 'N/A'}</span>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <span className="ml-2">{session.confidence_after || 'N/A'}</span>
                      </div>
                      
                      {session.notes && (
                        <div className="mt-3">
                          <div className="font-medium text-gray-600 mb-1">Notes:</div>
                          <div className="text-gray-600 text-sm line-clamp-3">{session.notes}</div>
                        </div>
                      )}
                      
                      {session.summary && (
                        <div className="mt-3">
                          <div className="font-medium text-gray-600 mb-1">Summary:</div>
                          <div className="text-gray-600 text-sm line-clamp-3">{session.summary}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => onScheduleReview(session.subject, session.topic, session.id)}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> 
                      Review this topic again
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudySessionList;
