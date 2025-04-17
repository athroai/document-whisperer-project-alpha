
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSubjects } from '@/hooks/useSubjects';
import { Loader2, CheckCircle, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { quizService } from '@/services/quizService';

export const DiagnosticQuizSelector: React.FC = () => {
  const { selectedSubjects, updateOnboardingStep } = useOnboarding();
  const { state } = useAuth();
  const { toast } = useToast();
  const [quizResults, setQuizResults] = useState<Record<string, number>>({});
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<Record<string, boolean>>({});
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const { subjects, isLoading } = useSubjects();

  // Use subject preferences from onboarding context
  const onboardingSubjects = selectedSubjects.map(subject => subject.subject);

  const startQuiz = async (subject: string) => {
    // Already taking a quiz
    if (currentSubject) return;

    setCurrentSubject(subject);
    setIsLoadingQuestions(prev => ({ ...prev, [subject]: true }));

    try {
      // Determine confidence level from subject preferences
      const subjectPreference = selectedSubjects.find(s => s.subject === subject);
      const confidence = subjectPreference?.confidence || 5;
      
      // Map confidence (1-10) to difficulty (1-5) by dividing by 2
      const difficulty = Math.ceil(confidence / 2);
      
      // Get questions for the subject
      const fetchedQuestions = await quizService.getQuestionsBySubject(
        subject, 
        difficulty,
        10 // Get 10 questions
      );
      
      setQuestions(fetchedQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});

    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Failed to load quiz",
        description: "Could not load questions for this subject. Please try again.",
        variant: "destructive"
      });
      setCurrentSubject(null);
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

  const handleQuizComplete = async () => {
    if (!state.user || !currentSubject) return;

    // Count correct answers
    let correctCount = 0;
    questions.forEach((question, index) => {
      const userAnswerId = selectedAnswers[index];
      if (userAnswerId) {
        const selectedAnswer = question.answers.find((a: any) => a.id === userAnswerId);
        if (selectedAnswer && selectedAnswer.isCorrect) {
          correctCount++;
        }
      }
    });

    // Calculate score percentage
    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    
    try {
      // Save to diagnostic_quiz_results
      await supabase.from('diagnostic_quiz_results').insert({
        student_id: state.user.id,
        subject: currentSubject,
        score: correctCount,
        total_questions: questions.length
      });

      // Save to diagnostic_results with percentage format
      await supabase.from('diagnostic_results').insert({
        student_id: state.user.id,
        subject_name: currentSubject,
        percentage_accuracy: scorePercentage
      });

      // Update user confidence in the subject
      await quizService.updateUserConfidenceScores(
        state.user.id, 
        currentSubject, 
        // Map score to confidence level (1-10)
        Math.max(1, Math.min(10, Math.round(scorePercentage / 10)))
      );

      setScore(scorePercentage);
      setQuizCompleted(true);
      setQuizResults(prev => ({ ...prev, [currentSubject!]: scorePercentage }));
      
      toast({
        title: "Quiz Completed",
        description: `You scored ${scorePercentage}% on ${currentSubject}`,
      });
    } catch (error) {
      console.error('Error saving quiz result:', error);
      toast({
        title: "Error",
        description: "Could not save your quiz results. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Reset quiz state after a delay to show results
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
    return onboardingSubjects.length > 0 && 
      onboardingSubjects.every(subject => quizResults[subject]);
  };

  const handleContinue = () => {
    updateOnboardingStep && updateOnboardingStep('generatePlan');
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading subjects...</div>;
  }

  // Only show subjects that were selected during onboarding
  const subjectsToShow = onboardingSubjects;
  
  // If no subjects were selected, show a message
  if (subjectsToShow.length === 0) {
    return (
      <div className="text-center py-4">
        <p>No subjects selected. Please go back to the previous step to select subjects.</p>
      </div>
    );
  }

  // If user is currently taking a quiz
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
          <h4 className="text-xl font-medium mb-4">{currentQuestion.text}</h4>
          
          <div className="space-y-3 mt-6">
            {currentQuestion.answers.map((answer: any) => (
              <div
                key={answer.id}
                onClick={() => handleAnswerSelect(answer.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedAnswers[currentQuestionIndex] === answer.id 
                    ? 'border-purple-600 bg-purple-50' 
                    : 'hover:border-purple-300'
                }`}
              >
                {answer.text}
              </div>
            ))}
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
          {subjectsToShow.map(subject => (
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
                      {isLoadingQuestions[subject] ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading</>
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
        <Button variant="outline">
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
