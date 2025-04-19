
import { useQuizOperations } from './quiz/useQuizOperations';
import { UseQuizStateProps } from './quiz/types';

export function useQuiz(props: UseQuizStateProps = {}) {
  // Create default initial state
  const initialState = {
    questions: {},
    currentQuestionIndex: 0,
    quizCompleted: false
  };
  
  return useQuizOperations({ 
    initialState,
    ...props 
  });
}

export type { UseQuizStateProps };
