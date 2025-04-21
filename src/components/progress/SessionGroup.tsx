
import React from 'react';
import { StudySession } from '@/types/study';
import { StudySessionCard } from './StudySessionCard';

interface SessionGroupProps {
  subject: string;
  sessions: StudySession[];
  expandedSession: string | null;
  setExpandedSession: (value: string | null) => void;
  onScheduleReview?: (subject: string, topic: string | undefined, sessionId?: string) => void;
  getConfidenceChange: (session: StudySession) => string | null;
}

export const SessionGroup: React.FC<SessionGroupProps> = ({
  subject,
  sessions,
  expandedSession,
  setExpandedSession,
  onScheduleReview,
  getConfidenceChange,
}) => (
  <div>
    <h2 className="text-xl font-bold mb-4">{subject}</h2>
    <div className="space-y-4">
      {sessions.map(session =>
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
);

