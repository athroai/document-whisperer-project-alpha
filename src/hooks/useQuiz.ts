
import { UseQuizStateProps, useQuizOperations } from './quiz/useQuizOperations';

export function useQuiz(props: UseQuizStateProps = {}) {
  return useQuizOperations(props);
}
