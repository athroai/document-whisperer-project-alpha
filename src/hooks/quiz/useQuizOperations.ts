import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { quizService } from '@/services/quizService';
import { supabase } from '@/lib/supabase';
import { Question } from '@/types/quiz';
import { ConfidenceLabel, confidenceToNumber, numberToConfidenceString } from '@/types/confidence';
import { useQuizState, UseQuizStateProps } from './useQuizState';

const MAX_RETRIES = 2;

export function useQuizOperations(props: UseQuizStateProps = {}) {
  const { state } = useAuth();
  const quizState = useQuizState(props);

  const startQuiz = async (subject: string | number, confidence: ConfidenceLabel) => {
    if (quizState.currentSubject) return;

    const subjectString = String(subject).trim();
    const numericConfidence = confidenceToNumber(confidence);
    const difficulty = Math.ceil(numericConfidence / 5);

    quizState.setCurrentSubject(subjectString);
    quizState.setIsLoadingQuestions(prev => ({ ...prev, [subjectString]: true }));
    quizState.setIsGenerating(prev => ({ ...prev, [subjectString]: true }));
    quizState.setError(null);

    try {
      const toastId = toast.loading(`Generating ${subjectString} quiz questions...`);
      quizState.setLoadingToastId(toastId);

      const fetchedQuestions = await quizService.getQuestionsBySubject(
        subjectString, 
        difficulty,
        5
      );
      
      if (quizState.loadingToastId) {
        toast.dismiss(quizState.loadingToastId);
        quizState.setLoadingToastId(null);
      }
      
      if (!fetchedQuestions || fetchedQuestions.length === 0) {
        throw new Error(`No questions were generated for ${subjectString}`);
      }

      const validQuestions = fetchedQuestions.filter(q => 
        q && 
        q.text && 
        q.answers && 
        q.answers.length === 4
      );
      
      if (validQuestions.length === 0) {
        throw new Error(`Generated questions for ${subjectString} are in an invalid format`);
      }

      quizState.setQuestions(validQuestions);
      quizState.setCurrentQuestionIndex(0);
      quizState.setSelectedAnswers({});
      quizState.setIsGenerating(prev => ({ ...prev, [subjectString]: false }));
      toast.success(`${subjectString} quiz ready!`);

    } catch (error: any) {
      console.error('Error fetching questions:', error);
      
      if (quizState.loadingToastId) {
        toast.dismiss(quizState.loadingToastId);
        quizState.setLoadingToastId(null);
      }
      
      const currentRetries = quizState.retryCount[subjectString] || 0;
      if (currentRetries < MAX_RETRIES) {
        quizState.setRetryCount(prev => ({ ...prev, [subjectString]: currentRetries + 1 }));
        toast.info(`Retrying ${subjectString} quiz generation...`);
        
        setTimeout(() => startQuiz(subjectString, confidence), 2000);
        return;
      }
      
      quizState.setError(`Could not generate ${subjectString} questions. Please try again later or contact support.`);
      toast.error(`Could not generate ${subjectString} questions. Please try again later.`);
      quizState.setCurrentSubject(null);
      quizState.setIsGenerating(prev => ({ ...prev, [subjectString]: false }));
    } finally {
      quizState.setIsLoadingQuestions(prev => ({ ...prev, [subjectString]: false }));
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
      quizState.setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = async () => {
    if (!state.user || !quizState.currentSubject) return;

    let correctCount = 0;
    let totalQuestions = quizState.questions.length;
    
    quizState.questions.forEach((question, index) => {
      const userAnswerId = quizState.selectedAnswers[index];
      if (userAnswerId) {
        const selectedAnswer = question.answers?.find(a => a.id === userAnswerId);
        if (selectedAnswer && selectedAnswer.isCorrect) {
          correctCount++;
        }
      }
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const subjectString = String(quizState.currentSubject);
    
    try {
      console.log(`Quiz completed for ${subjectString}. Score: ${correctCount}/${totalQuestions} (${scorePercentage}%)`);
      
      let helpLevel = "medium";
      if (scorePercentage >= 80) {
        helpLevel = "low";
      } else if (scorePercentage <= 40) {
        helpLevel = "high";
      }
      
      await supabase
        .from('diagnostic_quiz_results')
        .insert({
          student_id: state.user.id,
          subject: subjectString,
          score: correctCount,
          total_questions: totalQuestions
        })
        .select('id');
        
      await supabase
        .from('diagnostic_results')
        .insert({
          student_id: state.user.id,
          subject_name: subjectString,
          percentage_accuracy: scorePercentage
        })
        .select('id');

      const confidenceValue = Math.max(1, Math.min(10, Math.round(scorePercentage / 10)));
      const confidenceString = numberToConfidenceString(confidenceValue);
      
      await supabase
        .from('student_subject_preferences')
        .upsert({
          student_id: state.user.id,
          subject: subjectString,
          confidence_level: confidenceString
        }, { onConflict: 'student_id, subject' });

      try {
        const { data: existingSubject } = await supabase
          .from('student_subjects')
          .select('*')
          .eq('student_id', state.user.id)
          .eq('subject_name', subjectString)
          .maybeSingle();
        
        if (existingSubject) {
          await supabase
            .from('student_subjects')
            .update({ help_level: helpLevel })
            .eq('id', existingSubject.id);
        } else {
          await supabase
            .from('student_subjects')
            .insert({
              student_id: state.user.id,
              subject_name: subjectString,
              help_level: helpLevel
            });
        }
      } catch (e) {
        console.error("Error updating student_subjects:", e);
      }

      await supabase
        .from('onboarding_progress')
        .insert({
          student_id: state.user.id,
          current_step: 'diagnosticQuiz',
          has_completed_diagnostic: true
        })
        .select();

      quizState.setScore(scorePercentage);
      quizState.setQuizCompleted(true);
      quizState.setQuizResults(prev => ({ ...prev, [subjectString]: scorePercentage }));
      
      if (quizState.onQuizComplete) {
        quizState.onQuizComplete(subjectString, scorePercentage);
      }
      
      toast.success(`You scored ${scorePercentage}% on ${subjectString}`);
    } catch (error: any) {
      console.error('Error saving quiz result:', error);
      quizState.setError(error.message || "Could not save your quiz results");
      toast.error("Could not save your quiz results. Please try again.");
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
