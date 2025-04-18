
import { useState } from 'react';
import { Question } from '@/types/quiz';

export interface UseQuizStateProps {
  onQuizComplete?: (subject: string, score: number) => void;
}

export function useQuizState({ onQuizComplete }: UseQuizStateProps = {}) {
  // Explicitly type currentSubject as string | null only
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [retryCount, setRetryCount] = useState<Record<string, number>>({});
  const [loadingToastId, setLoadingToastId] = useState<string | null>(null);
  const [quizResults, setQuizResults] = useState<Record<string, number>>({});

  return {
    currentSubject,
    setCurrentSubject,
    questions,
    setQuestions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    selectedAnswers,
    setSelectedAnswers,
    quizCompleted,
    setQuizCompleted,
    score,
    setScore,
    error,
    setError,
    isLoadingQuestions,
    setIsLoadingQuestions,
    isGenerating,
    setIsGenerating,
    retryCount,
    setRetryCount,
    loadingToastId,
    setLoadingToastId,
    quizResults,
    setQuizResults,
    onQuizComplete
  };
}
