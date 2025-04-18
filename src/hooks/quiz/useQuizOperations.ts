import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { quizService } from '@/services/quizService';
import { ConfidenceLabel, getDifficultyFromConfidence } from '@/types/confidence';
import { useQuizState } from './useQuizState';
import { handleQuizCompletion } from './useQuizCompletion';
import { UseQuizStateProps } from './types';

const MAX_RETRIES = 2;

export function useQuizOperations(props: UseQuizStateProps = {}) {
  const { state } = useAuth();
  const quizState = useQuizState(props);

  const startQuiz = async (subject: string, confidence: ConfidenceLabel) => {
    if (quizState.currentSubject) return;
    if (!subject.trim()) return;

    const trimmedSubject = subject.trim();
    quizState.setCurrentSubject(trimmedSubject);
    quizState.setIsLoadingQuestions(prev => ({ ...prev, [trimmedSubject]: true }));
    quizState.setIsGenerating(prev => ({ ...prev, [trimmedSubject]: true }));
    quizState.setError(null);

    try {
      const toastId = toast.loading(`Generating ${trimmedSubject} quiz questions...`);
      quizState.setLoadingToastId(toastId);

      const fetchedQuestions = await quizService.getQuestionsBySubject(
        trimmedSubject, 
        getDifficultyFromConfidence(confidence),
        5
      );
      
      if (quizState.loadingToastId) {
        toast.dismiss(quizState.loadingToastId);
        quizState.setLoadingToastId(null);
      }
      
      if (!fetchedQuestions || fetchedQuestions.length === 0) {
        throw new Error(`No questions were generated for ${subject}`);
      }

      const validQuestions = fetchedQuestions.filter(q => 
        q && 
        q.text && 
        q.answers && 
        q.answers.length === 4
      );
      
      if (validQuestions.length === 0) {
        throw new Error(`Generated questions for ${subject} are in an invalid format`);
      }

      quizState.setQuestions(validQuestions);
      quizState.setCurrentQuestionIndex(0);
      quizState.setSelectedAnswers({});
      quizState.setIsGenerating(prev => ({ ...prev, [trimmedSubject]: false }));
      toast.success(`${subject} quiz ready!`);

    } catch (error: any) {
      console.error('Error fetching questions:', error);
      
      if (quizState.loadingToastId) {
        toast.dismiss(quizState.loadingToastId);
        quizState.setLoadingToastId(null);
      }
      
      const currentRetries = quizState.retryCount[subject] || 0;
      if (currentRetries < MAX_RETRIES) {
        quizState.setRetryCount(prev => ({ ...prev, [subject]: currentRetries + 1 }));
        toast.info(`Retrying ${subject} quiz generation...`);
        
        setTimeout(() => startQuiz(subject, confidence), 2000);
        return;
      }
      
      quizState.setError(`Could not generate ${subject} questions. Please try again later.`);
      toast.error(`Could not generate ${subject} questions. Please try again later.`);
      quizState.setCurrentSubject(null);
      quizState.setIsGenerating(prev => ({ ...prev, [trimmedSubject]: false }));
    } finally {
      quizState.setIsLoadingQuestions(prev => ({ ...prev, [trimmedSubject]: false }));
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    quizState.setSelectedAnswers(prev => ({
      ...prev,
      [quizState.currentQuestionIndex]: answerId
    }));
  };

  const handleNextQuestion = () => {
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      quizState.setCurrentQuestionIndex((prevIndex: number) => prevIndex + 1);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = async () => {
    if (!state.user || !quizState.currentSubject) return;

    try {
      await handleQuizCompletion(state.user.id, quizState, quizState.currentSubject);
    } catch (error: any) {
      quizState.setError(error.message);
      toast.error(error.message);
    } finally {
      setTimeout(() => {
        quizState.setCurrentSubject(null);
        quizState.setQuestions([]);
        quizState.setQuizCompleted(false);
      }, 2000);
    }
  };

  return {
    ...quizState,
    startQuiz,
    handleAnswerSelect,
    handleNextQuestion
  };
}
