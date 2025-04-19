// src/hooks/quiz/useQuizOperations.ts
import { useReducer, useState } from 'react';
import { ConfidenceLabel } from '@/types/confidence';
import { UseQuizOperationsProps, QuizQuestion, QuizResult, ExtendedQuizOperations } from './types';
import { Question } from '@/types/quiz';

interface QuestionState {
  answer: string | null;
  isCorrect?: boolean;
}

interface QuizState {
  questions: { [questionId: string]: QuestionState };
  currentQuestionIndex: number;
  quizCompleted: boolean;
}

type Action =
  | { type: 'MARK_ANSWER'; payload: { questionId: string; answer: string } }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREVIOUS_QUESTION' }
  | { type: 'SUBMIT_QUIZ' }
  | { type: 'RESET_QUIZ' };

const reducer = (state: QuizState, action: Action): QuizState => {
  switch (action.type) {
    case 'MARK_ANSWER':
      return {
        ...state,
        questions: {
          ...state.questions,
          [action.payload.questionId]: {
            ...state.questions[action.payload.questionId],
            answer: action.payload.answer,
          },
        },
      };
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, Object.keys(state.questions).length - 1),
      };
    case 'PREVIOUS_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
      };
    case 'SUBMIT_QUIZ':
      return {
        ...state,
        quizCompleted: true,
      };
    case 'RESET_QUIZ':
      return {
        ...state,
        questions: {},
        currentQuestionIndex: 0,
        quizCompleted: false,
      };
    default:
      return state;
  }
};

export const useQuizOperations = ({ initialState, onQuizComplete }: UseQuizOperationsProps): ExtendedQuizOperations => {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<{[key: string]: boolean}>({});
  const [isGenerating, setIsGenerating] = useState<{[key: string]: boolean}>({});
  const [quizResults, setQuizResults] = useState<{[key: string]: QuizResult}>({});

  const markAnswer = (questionId: string, answerIndex: number) => {
    const stringAnswerIndex = String(answerIndex);
    dispatch({ type: 'MARK_ANSWER', payload: { questionId, answer: stringAnswerIndex }});
  };

  const nextQuestion = () => {
    dispatch({ type: 'NEXT_QUESTION' });
  };

  const previousQuestion = () => {
    dispatch({ type: 'PREVIOUS_QUESTION' });
  };

  const submitQuiz = () => {
    dispatch({ type: 'SUBMIT_QUIZ' });
  };

  const resetQuiz = () => {
    dispatch({ type: 'RESET_QUIZ' });
  };

  const startQuiz = async (subject: string, confidence: ConfidenceLabel) => {
    setCurrentSubject(subject);
    setIsLoadingQuestions(prev => ({ ...prev, [subject]: true }));
    setIsGenerating(prev => ({ ...prev, [subject]: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockQuestions: Question[] = [
        {
          id: '1',
          text: `Sample question 1 for ${subject}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          difficulty: 'medium',
          subject: subject
        },
        {
          id: '2',
          text: `Sample question 2 for ${subject}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 1,
          difficulty: 'medium',
          subject: subject
        },
        {
          id: '3',
          text: `Sample question 3 for ${subject}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 2,
          difficulty: 'medium',
          subject: subject
        }
      ];
      
      setQuestions(mockQuestions);
      setSelectedAnswers({});
      setError(null);
    } catch (err) {
      console.error('Error starting quiz:', err);
      setError('Failed to load quiz questions');
    } finally {
      setIsLoadingQuestions(prev => ({ ...prev, [subject]: false }));
      setIsGenerating(prev => ({ ...prev, [subject]: false }));
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [state.currentQuestionIndex]: answerId
    }));
  };

  const handleNextQuestion = () => {
    if (state.currentQuestionIndex < questions.length - 1) {
      nextQuestion();
    } else {
      const score = 85;
      if (currentSubject && onQuizComplete) {
        onQuizComplete(currentSubject, score);
      }
      
      if (currentSubject) {
        setQuizResults(prev => ({
          ...prev,
          [currentSubject]: {
            score,
            totalQuestions: questions.length,
            completedAt: new Date().toISOString()
          }
        }));
      }
      
      setCurrentSubject(null);
      setQuestions([]);
    }
  };

  return { 
    state, 
    markAnswer, 
    nextQuestion, 
    previousQuestion, 
    submitQuiz, 
    resetQuiz, 
    dispatch,
    
    currentSubject,
    questions,
    currentQuestionIndex: state.currentQuestionIndex,
    selectedAnswers,
    error,
    isLoadingQuestions,
    isGenerating,
    quizResults,
    startQuiz,
    handleAnswerSelect,
    handleNextQuestion,
    setError
  };
};
