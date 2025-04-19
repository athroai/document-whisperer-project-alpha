// src/hooks/quiz/useQuizOperations.ts
import { useReducer } from 'react';

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

interface QuizOperations {
  state: QuizState;
  markAnswer: (questionId: string, answerIndex: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitQuiz: () => void;
  resetQuiz: () => void;
  dispatch: React.Dispatch<Action>;
}

interface UseQuizOperationsProps {
  initialState: QuizState;
}

export const useQuizOperations = ({ initialState }: UseQuizOperationsProps): QuizOperations => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const markAnswer = (questionId: string, answerIndex: number) => {
    const stringAnswerIndex = answerIndex.toString(); // Convert number to string
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

  return { state, markAnswer, nextQuestion, previousQuestion, submitQuiz, resetQuiz, dispatch };
};
