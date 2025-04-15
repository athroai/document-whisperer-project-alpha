
import { useState } from 'react';
import { AthroSubject } from '@/types/athro';

type SubjectProgress = {
  confidenceScores: Record<string, number>;
  quizScores: Array<{ topic: string; score: number; date: string }>;
};

type StudentProgressState = Record<string, SubjectProgress>;

export function useStudentProgress() {
  const [studentProgress, setStudentProgress] = useState<StudentProgressState>({
    Mathematics: {
      confidenceScores: {
        'Algebra': 7,
        'Geometry': 5,
        'Statistics': 8,
        'Trigonometry': 4
      },
      quizScores: [
        { topic: 'Algebra', score: 85, date: '2025-04-10' },
        { topic: 'Geometry', score: 72, date: '2025-04-08' },
        { topic: 'Statistics', score: 90, date: '2025-04-05' }
      ]
    },
    Science: {
      confidenceScores: {
        'Biology': 6,
        'Chemistry': 8,
        'Physics': 7
      },
      quizScores: [
        { topic: 'Biology', score: 78, date: '2025-04-12' },
        { topic: 'Chemistry', score: 85, date: '2025-04-09' }
      ]
    },
    English: {
      confidenceScores: {},
      quizScores: []
    },
    History: {
      confidenceScores: {},
      quizScores: []
    },
    Welsh: {
      confidenceScores: {},
      quizScores: []
    },
    Geography: {
      confidenceScores: {},
      quizScores: []
    },
    Languages: {
      confidenceScores: {},
      quizScores: []
    },
    RE: {
      confidenceScores: {},
      quizScores: []
    }
  });

  const getSuggestedTopics = (subject: AthroSubject, topics: string[]): string[] => {
    const subjectProgress = studentProgress[subject];
    if (!subjectProgress) return topics.slice(0, 5);
    
    return topics
      .sort((a, b) => {
        const scoreA = subjectProgress.confidenceScores[a] || 5;
        const scoreB = subjectProgress.confidenceScores[b] || 5;
        return scoreA - scoreB;
      })
      .slice(0, 5);
  };

  const updateConfidenceScore = (subject: AthroSubject, topic: string, score: number) => {
    setStudentProgress(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        confidenceScores: {
          ...prev[subject].confidenceScores,
          [topic]: score
        }
      }
    }));
  };

  const addQuizScore = (subject: AthroSubject, topic: string, score: number) => {
    setStudentProgress(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        quizScores: [
          ...prev[subject].quizScores,
          { topic, score, date: new Date().toISOString().split('T')[0] }
        ]
      }
    }));
  };

  return {
    studentProgress,
    getSuggestedTopics,
    updateConfidenceScore,
    addQuizScore
  };
}
