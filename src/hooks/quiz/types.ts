
import { Question } from '@/types/quiz';

export interface UseQuizStateProps {
  onQuizComplete?: (subject: string, score: number) => void;
}

export interface UseQuizState {
  currentSubject: string | null;
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswers: Record<number, string>;
  quizCompleted: boolean;
  score: number;
  error: string | null;
  isLoadingQuestions: Record<string, boolean>;
  isGenerating: Record<string, boolean>;
  retryCount: Record<string, number>;
  loadingToastId: string | null;
  quizResults: Record<string, number>;
  setCurrentSubject: (subject: string | null) => void;
  setQuestions: (questions: Question[]) => void;
  setCurrentQuestionIndex: (index: number | ((prevIndex: number) => number)) => void;
  setSelectedAnswers: (answers: Record<number, string> | ((prev: Record<number, string>) => Record<number, string>)) => void;
  setQuizCompleted: (completed: boolean) => void;
  setScore: (score: number) => void;
  setError: (error: string | null) => void;
  setIsLoadingQuestions: (loading: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  setIsGenerating: (generating: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  setRetryCount: (count: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => void;
  setLoadingToastId: (id: string | null) => void;
  setQuizResults: (results: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => void;
  onQuizComplete?: (subject: string, score: number) => void;
}
