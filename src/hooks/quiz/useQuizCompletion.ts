
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Question } from '@/types/quiz';
import { ConfidenceLabel } from '@/types/confidence';
import { UseQuizState } from './types';

export async function handleQuizCompletion(
  userId: string,
  quizState: UseQuizState,
  subject: string
) {
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
  
  try {
    console.log(`Quiz completed for ${subject}. Score: ${correctCount}/${totalQuestions} (${scorePercentage}%)`);
    
    let helpLevel = "medium";
    if (scorePercentage >= 80) {
      helpLevel = "low";
    } else if (scorePercentage <= 40) {
      helpLevel = "high";
    }

    await saveQuizResults(userId, subject, correctCount, totalQuestions, scorePercentage);
    await updateStudentPreferences(userId, subject, scorePercentage, helpLevel);

    quizState.setScore(scorePercentage);
    quizState.setQuizCompleted(true);
    quizState.setQuizResults(prev => ({ ...prev, [subject]: scorePercentage }));
    
    if (quizState.onQuizComplete) {
      quizState.onQuizComplete(subject, scorePercentage);
    }
    
    toast.success(`You scored ${scorePercentage}% on ${subject}`);
    
    return scorePercentage;
  } catch (error: any) {
    console.error('Error saving quiz result:', error);
    throw new Error(error.message || "Could not save your quiz results");
  }
}

async function saveQuizResults(
  userId: string,
  subject: string,
  correctCount: number,
  totalQuestions: number,
  scorePercentage: number
) {
  await supabase
    .from('diagnostic_quiz_results')
    .insert({
      student_id: userId,
      subject: subject,
      score: correctCount,
      total_questions: totalQuestions
    })
    .select();

  await supabase
    .from('diagnostic_results')
    .insert({
      student_id: userId,
      subject_name: subject,
      percentage_accuracy: scorePercentage
    })
    .select();
}

async function updateStudentPreferences(
  userId: string,
  subject: string,
  scorePercentage: number,
  helpLevel: string
) {
  const confidenceValue: ConfidenceLabel = scorePercentage >= 80 ? "Very confident" :
                        scorePercentage >= 60 ? "Slightly confident" :
                        scorePercentage >= 40 ? "Neutral" :
                        scorePercentage >= 20 ? "Slightly unsure" :
                        "Very unsure";

  await supabase
    .from('student_subject_preferences')
    .upsert({
      student_id: userId,
      subject: subject,
      confidence_level: confidenceValue
    }, { onConflict: 'student_id, subject' });

  try {
    const { data: existingSubject } = await supabase
      .from('student_subjects')
      .select('*')
      .eq('student_id', userId)
      .eq('subject_name', subject)
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
          student_id: userId,
          subject_name: subject,
          help_level: helpLevel
        });
    }
  } catch (e) {
    console.error("Error updating student_subjects:", e);
  }

  await supabase
    .from('onboarding_progress')
    .insert({
      student_id: userId,
      current_step: 'diagnosticQuiz',
      has_completed_diagnostic: true
    })
    .select();
}
