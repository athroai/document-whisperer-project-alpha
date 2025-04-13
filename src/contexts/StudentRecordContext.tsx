
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import GoalsService from '@/services/goalsService';
import { StudyGoal } from '@/types/goals';

// Define types for subject data
export interface SubjectData {
  confidence: number;
  lastStudied: string | null;
  sessionsThisWeek: number;
  quizScores: number[];
  averageScore: number;
  suggestionDismissals?: number; // Track dismissals for teacher notifications
  suggestionActions?: number; // Track suggestion acceptances
}

export interface StudentRecord {
  [subject: string]: SubjectData;
}

interface StudentRecordContextType {
  studentRecord: StudentRecord;
  activeGoals: StudyGoal[];
  updateSubjectConfidence: (subject: string, confidence: number) => void;
  updateSubjectQuizScore: (subject: string, score: number) => void;
  recordStudySession: (subject: string) => void;
  getRecommendedSubject: () => string | null;
  recordSuggestionDismissal: (subject: string) => void;
  recordSuggestionAction: (subject: string, actionType: 'study' | 'quiz' | 'review' | 'info') => void;
  refreshGoals: () => void;
}

const defaultSubjectData: SubjectData = {
  confidence: 5,
  lastStudied: null,
  sessionsThisWeek: 0,
  quizScores: [],
  averageScore: 0,
  suggestionDismissals: 0,
  suggestionActions: 0
};

// Default subjects
const defaultSubjects = ['maths', 'science', 'english', 'history'];

// Initialize default record
const initializeRecord = (): StudentRecord => {
  const record: StudentRecord = {};
  defaultSubjects.forEach(subject => {
    record[subject] = { ...defaultSubjectData };
  });
  return record;
};

const StudentRecordContext = createContext<StudentRecordContextType | null>(null);

export const StudentRecordProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studentRecord, setStudentRecord] = useState<StudentRecord>(initializeRecord());
  const [activeGoals, setActiveGoals] = useState<StudyGoal[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const { state } = useAuth();
  const { user } = state;

  // Initialize from localStorage or backend
  useEffect(() => {
    if (user) {
      const savedRecord = localStorage.getItem(`student_record_${user.id}`);
      if (savedRecord) {
        setStudentRecord(JSON.parse(savedRecord));
      }
    }
  }, [user]);

  // Load active goals whenever the user or refresh trigger changes
  useEffect(() => {
    const loadActiveGoals = async () => {
      if (user) {
        try {
          // Try to get goals from Firestore
          let userGoals = await GoalsService.getGoalsForUser(user.id);
          
          // If no goals from Firestore or offline, use mock data
          if (userGoals.length === 0) {
            userGoals = GoalsService.getLocalMockGoals(user.id);
          }
          
          // Filter to active goals and update progress
          const active = userGoals.filter(goal => goal.status === 'active');
          setActiveGoals(active);
        } catch (error) {
          console.error("Error loading goals:", error);
          setActiveGoals([]);
        }
      }
    };
    
    loadActiveGoals();
  }, [user, refreshTrigger]);

  // Save to localStorage when record changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`student_record_${user.id}`, JSON.stringify(studentRecord));
    }
  }, [studentRecord, user]);

  // Update confidence for a subject
  const updateSubjectConfidence = (subject: string, confidence: number) => {
    setStudentRecord(prev => {
      const subjectData = prev[subject] || { ...defaultSubjectData };
      return {
        ...prev,
        [subject]: {
          ...subjectData,
          confidence
        }
      };
    });
    
    // Update goal progress for related goals
    if (user) {
      const relatedGoals = activeGoals.filter(goal => 
        goal.subject.toLowerCase().includes(subject.toLowerCase())
      );
      
      relatedGoals.forEach(goal => {
        const currentProgress = goal.completionRate || 0;
        // Increase progress based on confidence change
        // This is a simplified approach - in a real system you might have more complex logic
        if (confidence > 7) {
          const newProgress = Math.min(95, currentProgress + 5);
          GoalsService.updateGoal(goal.id, { completionRate: newProgress });
        }
      });
    }
  };

  // Add a quiz score and update average
  const updateSubjectQuizScore = (subject: string, score: number) => {
    setStudentRecord(prev => {
      const subjectData = prev[subject] || { ...defaultSubjectData };
      const newScores = [...subjectData.quizScores, score];
      const newAverage = newScores.reduce((sum, score) => sum + score, 0) / newScores.length;
      
      return {
        ...prev,
        [subject]: {
          ...subjectData,
          quizScores: newScores,
          averageScore: parseFloat(newAverage.toFixed(1))
        }
      };
    });
    
    // Update goal progress for related goals
    if (user) {
      const relatedGoals = activeGoals.filter(goal => 
        goal.subject.toLowerCase().includes(subject.toLowerCase())
      );
      
      relatedGoals.forEach(goal => {
        const currentProgress = goal.completionRate || 0;
        // Increase progress based on quiz score
        if (score > 70) {
          const newProgress = Math.min(95, currentProgress + 10);
          GoalsService.updateGoal(goal.id, { completionRate: newProgress });
        } else if (score > 50) {
          const newProgress = Math.min(95, currentProgress + 5);
          GoalsService.updateGoal(goal.id, { completionRate: newProgress });
        }
      });
    }
  };

  // Record a study session
  const recordStudySession = (subject: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    setStudentRecord(prev => {
      const subjectData = prev[subject] || { ...defaultSubjectData };
      return {
        ...prev,
        [subject]: {
          ...subjectData,
          lastStudied: today,
          sessionsThisWeek: subjectData.sessionsThisWeek + 1
        }
      };
    });
    
    // Update goal progress for related goals
    if (user) {
      const relatedGoals = activeGoals.filter(goal => 
        goal.subject.toLowerCase().includes(subject.toLowerCase())
      );
      
      relatedGoals.forEach(goal => {
        const currentProgress = goal.completionRate || 0;
        // Increase progress based on study session
        const newProgress = Math.min(95, currentProgress + 3);
        GoalsService.updateGoal(goal.id, { completionRate: newProgress });
      });
    }
  };

  // Record suggestion dismissal for analytics
  const recordSuggestionDismissal = (subject: string) => {
    setStudentRecord(prev => {
      const subjectData = prev[subject] || { ...defaultSubjectData };
      const dismissals = (subjectData.suggestionDismissals || 0) + 1;
      
      // If user has dismissed 3+ suggestions, we could notify the teacher
      // This would connect to a notification system in a real app
      if (dismissals >= 3 && user) {
        console.log(`Notification: Student ${user.id} has dismissed ${dismissals} suggestions for ${subject}`);
        // In a real app: notifyTeacher(user.id, subject, 'persistent dismissals');
      }
      
      return {
        ...prev,
        [subject]: {
          ...subjectData,
          suggestionDismissals: dismissals
        }
      };
    });
  };

  // Record when user takes action on a suggestion
  const recordSuggestionAction = (subject: string, actionType: 'study' | 'quiz' | 'review' | 'info') => {
    setStudentRecord(prev => {
      const subjectData = prev[subject] || { ...defaultSubjectData };
      return {
        ...prev,
        [subject]: {
          ...subjectData,
          suggestionActions: (subjectData.suggestionActions || 0) + 1
        }
      };
    });
    
    // In a real app, we might log this to analytics:
    console.log(`Student ${user?.id || 'unknown'} took ${actionType} action for ${subject}`);
  };

  // Get recommended subject based on confidence and last studied date
  const getRecommendedSubject = (): string | null => {
    if (Object.keys(studentRecord).length === 0) return null;
    
    // Calculate a priority score: lower confidence and older last studied date = higher priority
    const subjects = Object.entries(studentRecord);
    const currentDate = new Date();
    
    const subjectScores = subjects.map(([subject, data]) => {
      const confidenceScore = 10 - data.confidence; // Invert so lower confidence = higher score
      
      // Calculate days since last studied
      let daysSinceLastStudy = 30; // Default to a month if never studied
      if (data.lastStudied) {
        const lastStudied = new Date(data.lastStudied);
        const diffTime = Math.abs(currentDate.getTime() - lastStudied.getTime());
        daysSinceLastStudy = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      
      // Combine factors with weights
      const priorityScore = (confidenceScore * 2) + (daysSinceLastStudy);
      
      return { subject, priorityScore };
    });
    
    // Sort by priority score descending
    subjectScores.sort((a, b) => b.priorityScore - a.priorityScore);
    
    return subjectScores[0]?.subject || null;
  };

  // Refresh goals data
  const refreshGoals = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <StudentRecordContext.Provider value={{
      studentRecord,
      activeGoals,
      updateSubjectConfidence,
      updateSubjectQuizScore,
      recordStudySession,
      getRecommendedSubject,
      recordSuggestionDismissal,
      recordSuggestionAction,
      refreshGoals
    }}>
      {children}
    </StudentRecordContext.Provider>
  );
};

export const useStudentRecord = () => {
  const context = useContext(StudentRecordContext);
  if (!context) {
    throw new Error('useStudentRecord must be used within a StudentRecordProvider');
  }
  return context;
};
