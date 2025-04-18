
import { useQuizOperations } from './quiz/useQuizOperations';

export function useQuiz(props = {}) {
  return useQuizOperations(props);
}
