
import { useMemo } from 'react';
import { StudySession } from '@/types/study';

export function useFilteredSessions(
  sessions: StudySession[],
  confidenceFilter: 'all' | 'unsure',
  subjectFilter: string,
  groupBySubject: boolean = false
) {
  // getConfidenceChange and getConfidenceBadgeColor adapted from original implementation
  const getConfidenceChange = (session: StudySession) => {
    if (!session.confidenceAfter || !session.confidenceBefore) return null;

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

  const filteredSessions = useMemo(() => {
    let result = [...sessions];

    if (confidenceFilter === 'unsure') {
      result = result.filter(session => {
        const confidenceChange = getConfidenceChange(session);
        return confidenceChange === "No change" || confidenceChange === "Needs more work";
      });
    }
    if (subjectFilter !== 'all') {
      result = result.filter(session => session.subject === subjectFilter);
    }
    return result;
  }, [sessions, confidenceFilter, subjectFilter]);

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

  return {
    filteredSessions,
    groupedSessions,
    getConfidenceChange,
  };
}
