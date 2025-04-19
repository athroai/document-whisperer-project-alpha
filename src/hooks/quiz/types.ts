
import { ConfidenceLabel } from '@/types/confidence';
import { Question } from '@/types/quiz';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer?: number;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export interface UseQuizStateProps {
  onQuizComplete?: (subject: string, score: number) => void;
}

export interface UseQuizState {
  currentSubject: string | null;
  setCurrentSubject: (subject: string | null) => void;
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (indexOrFn: number | ((prev: number) => number)) => void;
  selectedAnswers: Record<number, string>;
  setSelectedAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  quizCompleted: boolean;
  setQuizCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  isLoadingQuestions: Record<string, boolean>;
  setIsLoadingQuestions: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  isGenerating: Record<string, boolean>;
  setIsGenerating: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  retryCount: Record<string, number>;
  setRetryCount: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  loadingToastId: string | null;
  setLoadingToastId: React.Dispatch<React.SetStateAction<string | null>>;
  quizResults: Record<string, number>;
  setQuizResults: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  onQuizComplete?: (subject: string, score: number) => void;
}

export interface UseQuizOperationsProps extends UseQuizStateProps {
  initialState: {
    questions: { [questionId: string]: any };
    currentQuestionIndex: number;
    quizCompleted: boolean;
  };
}

// Extending the QuizOperations interface to include all properties used in DiagnosticQuizSelector
export interface ExtendedQuizOperations {
  state: {
    questions: { [questionId: string]: any };
    currentQuestionIndex: number;
    quizCompleted: boolean;
  };
  dispatch: React.Dispatch<any>;
  markAnswer: (questionId: string, answerIndex: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitQuiz: () => void;
  resetQuiz: () => void;
  
  // Additional properties used in DiagnosticQuizSelector
  currentSubject: string | null;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  selectedAnswers: { [key: number]: string };
  error: string | null;
  isLoadingQuestions: { [key: string]: boolean };
  isGenerating: { [key: string]: boolean };
  quizResults: { [key: string]: QuizResult | number };
  startQuiz: (subject: string, confidence: ConfidenceLabel) => void;
  handleAnswerSelect: (answerId: string) => void;
  handleNextQuestion: () => void;
  setError: (error: string | null) => void;
}
