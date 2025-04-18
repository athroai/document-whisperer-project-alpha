
import { useQuizOperations } from './quiz/useQuizOperations';
import { UseQuizStateProps } from './quiz/types';

export function useQuiz(props: UseQuizStateProps = {}) {
  return useQuizOperations(props);
}

export type { UseQuizStateProps };
