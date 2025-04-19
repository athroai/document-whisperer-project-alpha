
import { ConfidenceLabel } from '@/types/confidence';

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
  quizResults: { [key: string]: QuizResult };
  startQuiz: (subject: string, confidence: ConfidenceLabel) => void;
  handleAnswerSelect: (answerId: string) => void;
  handleNextQuestion: () => void;
  setError: (error: string | null) => void;
}
