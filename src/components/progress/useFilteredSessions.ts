
import { useState, useMemo } from 'react';
import { StudySession } from '@/types/study';

export const useFilteredSessions = (
  sessions: StudySession[] = [], 
  confidenceFilter: 'all' | 'unsure' = 'all', 
  subjectFilter: string = 'all',
  groupBySubject: boolean = false
) => {
  const [innerSubjectFilter, setInnerSubjectFilter] = useState<string | null>(null);
  
  // Filter sessions based on subject and confidence
  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];
    
    // Apply subject filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(session => session.subject === subjectFilter);
    }
    
    // Apply confidence filter
    if (confidenceFilter === 'unsure') {
      filtered = filtered.filter(session => {
        const before = session.confidence_before || 0;
        const after = session.confidence_after || 0;
        return after - before <= 0; // No improvement or worse
      });
    }
    
    return filtered;
  }, [sessions, confidenceFilter, subjectFilter]);
  
  // Group sessions by subject for easier display
  const groupedSessions = useMemo(() => {
    if (!groupBySubject) return null;
    
    return filteredSessions.reduce((acc: Record<string, StudySession[]>, session) => {
      if (!acc[session.subject]) {
        acc[session.subject] = [];
      }
      acc[session.subject].push(session);
      return acc;
    }, {});
  }, [filteredSessions, groupBySubject]);
  
  // Calculate confidence change for a session
  const getConfidenceChange = (session: StudySession): string | null => {
    if (session.confidence_before === undefined || session.confidence_after === undefined) {
      return null;
    }
    
    const change = session.confidence_after - session.confidence_before;
    
    if (change > 0) {
      return `+${change} confidence`;
    } else if (change < 0) {
      return `${change} confidence`;
    } else {
      return 'No change';
    }
  };
  
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
    groupedSessions,
    subjectFilter: innerSubjectFilter,
    setSubjectFilter: setInnerSubjectFilter,
    improvementMetrics,
    getConfidenceChange
  };
};
