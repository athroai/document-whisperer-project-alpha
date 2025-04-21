
import { useState, useMemo } from 'react';
import { StudySession } from '@/types/study';

export const useFilteredSessions = (sessions: StudySession[] = []) => {
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  
  // Filter sessions based on subject
  const filteredSessions = useMemo(() => {
    if (!subjectFilter) return sessions;
    return sessions.filter(session => session.subject === subjectFilter);
  }, [sessions, subjectFilter]);
  
  // Calculate improvement metrics
  const improvementMetrics = useMemo(() => {
    const sessionsWithConfidence = sessions.filter(
      session => session.confidence_after != null && session.confidence_before != null
    );
    
    const averageImprovement = sessionsWithConfidence.length > 0 
      ? sessionsWithConfidence.reduce((sum, session) => {
          const before = session.confidence_before || 0;
          const after = session.confidence_after || 0;
          return sum + (after - before);
        }, 0) / sessionsWithConfidence.length
      : 0;
      
    const subjectImprovements = sessionsWithConfidence.reduce((acc: Record<string, number[]>, session) => {
      if (!acc[session.subject]) {
        acc[session.subject] = [];
      }
      
      const before = session.confidence_before || 0;
      const after = session.confidence_after || 0;
      acc[session.subject].push(after - before);
      
      return acc;
    }, {});
    
    return {
      averageImprovement,
      subjectImprovements
    };
  }, [sessions]);
  
  return {
    filteredSessions,
    subjectFilter,
    setSubjectFilter,
    improvementMetrics
  };
};
