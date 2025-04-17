
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSubjects } from '@/hooks/useSubjects';
import { Loader2, CheckCircle, BookOpen, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { quizService } from '@/services/quizService';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Question } from '@/types/quiz';
import { useToast } from '@/hooks/use-toast';

export const DiagnosticQuizSelector: React.FC = () => {
  const { selectedSubjects, updateOnboardingStep } = useOnboarding();
  const { state } = useAuth();
  const { toast: uiToast } = useToast();
  const [quizResults, setQuizResults] = useState<Record<string, number>>({});
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { subjects, isLoading } = useSubjects();
  const [retryCount, setRetryCount] = useState<Record<string, number>>({});
  const [loadingToastId, setLoadingToastId] = useState<string | null>(null);
  const [selectedConfidence, setSelectedConfidence] = useState<string>('5');

  const MAX_RETRIES = 2;

  const startQuiz = async (subject: string) => {
    if (currentSubject) return;

    setCurrentSubject(subject);
    setIsLoadingQuestions(prev => ({ ...prev, [subject]: true }));
    setIsGenerating(prev => ({ ...prev, [subject]: true }));
    setError(null);

    try {
      const subjectPreference = selectedSubjects?.find(s => s.subject === subject);
      const confidence = subjectPreference?.confidence || 5;
      const difficulty = Math.ceil(confidence / 2);

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
        
        setTimeout(() => startQuiz(subject), 2000);
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

  const handleConfidenceChange = (newValue: number[]) => {
    // Explicitly cast to string to resolve TypeScript error
    setSelectedConfidence(String(newValue[0]));
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
      
      // Save quiz result to diagnostic_quiz_results table
      const { data: quizResultData, error: quizResultError } = await supabase
        .from('diagnostic_quiz_results')
        .insert({
          student_id: state.user.id,
          subject: currentSubject,
          score: correctCount,
          total_questions: totalQuestions
        })
        .select('id');
        
      if (quizResultError) {
        console.error('Error saving quiz result to diagnostic_quiz_results:', quizResultError);
        throw new Error('Failed to save quiz results');
      }

      // Save result to diagnostic_results table
      const { data: diagData, error: diagError } = await supabase
        .from('diagnostic_results')
        .insert({
          student_id: state.user.id,
          subject_name: currentSubject,
          percentage_accuracy: scorePercentage
        })
        .select('id');
        
      if (diagError) {
        console.error('Error saving to diagnostic_results:', diagError);
        throw new Error('Failed to save diagnostic results');
      }

      // Update confidence level
      const newConfidence = Math.max(1, Math.min(10, Math.round(scorePercentage / 10)));
      
      await supabase
        .from('student_subject_preferences')
        .upsert({
          student_id: state.user.id,
          subject: currentSubject,
          confidence_level: newConfidence
        }, { onConflict: 'student_id, subject' });

      // Update or insert student_subjects with help_level
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

      // Update onboarding progress
      await supabase
        .from('onboarding_progress')
        .upsert({
          student_id: state.user.id,
          current_step: 'diagnosticQuiz',
          has_completed_diagnostic: true
        }, {
          onConflict: 'student_id'
        });

      setScore(scorePercentage);
      setQuizCompleted(true);
      setQuizResults(prev => ({ ...prev, [currentSubject!]: scorePercentage }));
      
      uiToast({
        description: `You scored ${scorePercentage}% on ${currentSubject}`,
      });
    } catch (error: any) {
      console.error('Error saving quiz result:', error);
      setError(error.message || "Could not save your quiz results");
      uiToast({
        description: "Could not save your quiz results. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setCurrentSubject(null);
        setQuestions([]);
        setQuizCompleted(false);
      }, 2000);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      handleQuizComplete();
    }
  };

  const allQuizzesCompleted = () => {
    return selectedSubjects.length > 0 && 
      selectedSubjects.every(subject => quizResults[subject.subject]);
  };

  const handleContinue = () => {
    updateOnboardingStep('generatePlan');
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading subjects...</div>;
  }

  const subjectsToShow = selectedSubjects?.map(subject => subject.subject) || [];
  
  if (!subjectsToShow || subjectsToShow.length === 0) {
    return (
      <div className="text-center py-4">
        <p>No subjects selected. Please go back to the previous step to select subjects.</p>
      </div>
    );
  }

  if (currentSubject && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const isAnswerSelected = selectedAnswers[currentQuestionIndex] !== undefined;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{currentSubject} Diagnostic Quiz</h3>
          <span className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>

        <Progress value={(currentQuestionIndex / questions.length) * 100} className="h-2" />

        <div className="p-6 bg-white rounded-lg shadow">
          <h4 className="text-xl font-medium mb-4">{currentQuestion?.text || "Loading question..."}</h4>
          
          <div className="space-y-3 mt-6">
            {currentQuestion?.answers && Array.isArray(currentQuestion.answers) && currentQuestion.answers.length > 0 ? (
              currentQuestion.answers.map((answer: any) => (
                <button
                  key={answer.id}
                  onClick={() => handleAnswerSelect(answer.id)}
                  className={`p-4 w-full border rounded-lg text-left transition-all ${
                    selectedAnswers[currentQuestionIndex] === answer.id 
                      ? 'border-purple-600 bg-purple-50' 
                      : 'hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  {answer.text}
                </button>
              ))
            ) : (
              <div className="p-4 text-amber-500">
                Loading answer choices...
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleNextQuestion}
              disabled={!isAnswerSelected}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div>
        <p className="mb-4">Take these quick diagnostic quizzes to help us create a personalized study plan:</p>
        
        {quizCompleted && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-800">
              You scored {score}% on your {currentSubject} quiz. Great job!
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {subjectsToShow.map((subject) => (
            <Card key={subject}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
                    <h4 className="text-lg font-medium">{subject}</h4>
                  </div>
                  
                  {quizResults[subject] !== undefined ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-1" />
                      <span>{quizResults[subject]}% Score</span>
                    </div>
                  ) : (
                    <Button 
                      variant={isLoadingQuestions[subject] ? "outline" : "default"}
                      disabled={isLoadingQuestions[subject] || currentSubject !== null}
                      onClick={() => startQuiz(subject)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating[subject] ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating</>
                      ) : isLoadingQuestions[subject] ? (
                        <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading</>
                      ) : (
                        'Take Quiz'
                      )}
                    </Button>
                  )}
                </div>
                
                {quizResults[subject] !== undefined && (
                  <Progress value={quizResults[subject]} className="mt-3" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline"
          onClick={() => updateOnboardingStep('generatePlan')}
        >
          Skip All Quizzes
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={!allQuizzesCompleted()}
          className="bg-green-600 hover:bg-green-700"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
