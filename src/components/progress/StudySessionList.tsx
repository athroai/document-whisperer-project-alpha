
import React, { useState } from 'react';
import { StudySession } from '@/types/study';
import { Card, CardContent } from '@/components/ui/card';
import { StudySessionCard } from './StudySessionCard';
import { useFilteredSessions } from './useFilteredSessions';

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

  const {
    filteredSessions,
    groupedSessions,
    getConfidenceChange,
  } = useFilteredSessions(sessions, confidenceFilter, subjectFilter, groupBySubject);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/3 m-6" />
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

  if (groupBySubject && groupedSessions) {
    return (
      <div className="space-y-8">
        {Object.entries(groupedSessions).map(([subject, subjectSessions]) => (
          <div key={subject}>
            <h2 className="text-xl font-bold mb-4">{subject}</h2>
            <div className="space-y-4">
              {subjectSessions.map(session =>
                <StudySessionCard
                  key={session.id}
                  session={session}
                  isExpanded={expandedSession === session.id}
                  onExpand={setExpandedSession}
                  onScheduleReview={onScheduleReview}
                  confidenceChange={getConfidenceChange(session)}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Chronological
  return (
    <div className="space-y-4">
      {filteredSessions.map(session =>
        <StudySessionCard
          key={session.id}
          session={session}
          isExpanded={expandedSession === session.id}
          onExpand={setExpandedSession}
          onScheduleReview={onScheduleReview}
          confidenceChange={getConfidenceChange(session)}
        />
      )}
    </div>
  );
};
