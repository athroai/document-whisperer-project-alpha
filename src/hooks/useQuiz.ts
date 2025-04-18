
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Question } from '@/types/quiz';
import { quizService } from '@/services/quizService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// Define the MAX_RETRIES constant
const MAX_RETRIES = 2;

interface UseQuizProps {
  onQuizComplete?: (subject: string, score: number) => void;
}

export function useQuiz({ onQuizComplete }: UseQuizProps = {}) {
  const { state } = useAuth();
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

  const startQuiz = async (subject: string, confidence: string | number) => {
    if (currentSubject) return;

    const numericConfidence = typeof confidence === 'string' ? parseInt(confidence, 10) : confidence;
    const difficulty = Math.ceil(numericConfidence / 2);

    setCurrentSubject(subject);
    setIsLoadingQuestions(prev => ({ ...prev, [subject]: true }));
    setIsGenerating(prev => ({ ...prev, [subject]: true }));
    setError(null);

    try {
      const toastId = toast.loading(`Generating ${subject} quiz questions...`);
      setLoadingToastId(toastId);

      const fetchedQuestions = await quizService.getQuestionsBySubject(
        subject, 
        difficulty,
        5
      );
      
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
        setLoadingToastId(null);
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

      setQuestions(validQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setIsGenerating(prev => ({ ...prev, [subject]: false }));
      toast.success(`${subject} quiz ready!`);

    } catch (error: any) {
      console.error('Error fetching questions:', error);
      
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
        setLoadingToastId(null);
      }
      
      const currentRetries = retryCount[subject] || 0;
      if (currentRetries < MAX_RETRIES) {
        setRetryCount(prev => ({ ...prev, [subject]: currentRetries + 1 }));
        toast.info(`Retrying ${subject} quiz generation...`);
        
        setTimeout(() => startQuiz(subject, confidence), 2000);
        return;
      }
      
      setError(`Could not generate ${subject} questions. Please try again later or contact support.`);
      toast.error(`Could not generate ${subject} questions. Please try again later.`);
      setCurrentSubject(null);
      setIsGenerating(prev => ({ ...prev, [subject]: false }));
    } finally {
      setIsLoadingQuestions(prev => ({ ...prev, [subject]: false }));
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answerId
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = async () => {
    if (!state.user || !currentSubject) return;

    let correctCount = 0;
    let totalQuestions = questions.length;
    
    questions.forEach((question, index) => {
      const userAnswerId = selectedAnswers[index];
      if (userAnswerId) {
        const selectedAnswer = question.answers?.find(a => a.id === userAnswerId);
        if (selectedAnswer && selectedAnswer.isCorrect) {
          correctCount++;
        }
      }
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    
    try {
      console.log(`Quiz completed for ${currentSubject}. Score: ${correctCount}/${totalQuestions} (${scorePercentage}%)`);
      
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
          subject: currentSubject,
          score: correctCount,
          total_questions: totalQuestions
        })
        .select('id');
        
      await supabase
        .from('diagnostic_results')
        .insert({
          student_id: state.user.id,
          subject_name: currentSubject,
          percentage_accuracy: scorePercentage
        })
        .select('id');

      const newConfidence = Math.max(1, Math.min(10, Math.round(scorePercentage / 10)));
      
      await supabase
        .from('student_subject_preferences')
        .upsert({
          student_id: state.user.id,
          subject: currentSubject,
          confidence_level: String(newConfidence)
        }, { onConflict: 'student_id, subject' });

      try {
        const { data: existingSubject } = await supabase
          .from('student_subjects')
          .select('*')
          .eq('student_id', state.user.id)
          .eq('subject_name', currentSubject)
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
              subject_name: currentSubject,
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

      setScore(scorePercentage);
      setQuizCompleted(true);
      setQuizResults(prev => ({ ...prev, [currentSubject!]: scorePercentage }));
      
      if (onQuizComplete) {
        onQuizComplete(currentSubject, scorePercentage);
      }
      
      toast.success(`You scored ${scorePercentage}% on ${currentSubject}`);
    } catch (error: any) {
      console.error('Error saving quiz result:', error);
      setError(error.message || "Could not save your quiz results");
      toast.error("Could not save your quiz results. Please try again.");
    } finally {
      setTimeout(() => {
        setCurrentSubject(null);
        setQuestions([]);
        setQuizCompleted(false);
      }, 2000);
    }
  };

  return {
    currentSubject,
    questions,
    currentQuestionIndex,
    selectedAnswers,
    quizCompleted,
    score,
    error,
    isLoadingQuestions,
    isGenerating,
    quizResults,
    startQuiz,
    handleAnswerSelect,
    handleNextQuestion,
    setError
  };
}
