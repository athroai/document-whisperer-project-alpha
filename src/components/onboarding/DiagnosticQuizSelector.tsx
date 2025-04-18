
import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useSubjects } from '@/hooks/useSubjects';
import { useQuiz } from '@/hooks/useQuiz';
import { SubjectQuizCard } from './quiz/SubjectQuizCard';
import { QuizQuestion } from './quiz/QuizQuestion';
import { useToast } from '@/hooks/use-toast';
import { ConfidenceLabel, confidenceOptions } from '@/types/confidence';
import { cn } from '@/lib/utils';

export const DiagnosticQuizSelector: React.FC = () => {
  const { toast: uiToast } = useToast();
  const { selectedSubjects, updateOnboardingStep } = useOnboarding();
  const { subjects, isLoading: isLoadingSubjects } = useSubjects();
  const [selectedConfidence, setSelectedConfidence] = useState<ConfidenceLabel>("Neutral");
  
  const { 
    currentSubject,
    questions,
    currentQuestionIndex,
    selectedAnswers,
    error,
    isLoadingQuestions,
    isGenerating,
    quizResults,
    startQuiz,
    handleAnswerSelect,
    handleNextQuestion,
    setError
  } = useQuiz({
    onQuizComplete: (subject, score) => {
      uiToast({
        description: `You scored ${score}% on ${subject}`,
      });
    }
  });

  const handleStartQuiz = (subject: string) => {
    const subjectString = String(subject).trim();
    if (subjectString) {
      startQuiz(subjectString, selectedConfidence);
    }
  };

  const allQuizzesCompleted = () => {
    return selectedSubjects.length > 0 && 
      selectedSubjects.every(subject => quizResults[subject.subject]);
  };

  const handleContinue = () => {
    updateOnboardingStep('generatePlan');
  };

  if (isLoadingSubjects) {
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
    
    return (
      <QuizQuestion
        question={currentQuestion}
        currentIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        selectedAnswerId={selectedAnswers[currentQuestionIndex]}
        onAnswerSelect={handleAnswerSelect}
        onNextQuestion={handleNextQuestion}
        subject={currentSubject}
      />
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">How confident are you in these subjects?</h3>
        <p className="text-sm text-muted-foreground">
          We'll use this to choose how challenging your quiz should be.
        </p>
        
        <div className="flex flex-wrap gap-2">
          {confidenceOptions.map((confidence) => (
            <Button
              key={confidence}
              onClick={() => setSelectedConfidence(confidence)}
              variant={selectedConfidence === confidence ? "default" : "outline"}
              className={cn(
                "flex-1 min-w-[120px]",
                selectedConfidence === confidence && "bg-purple-600 hover:bg-purple-700"
              )}
            >
              {confidence}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjectsToShow.map((subject) => (
          <SubjectQuizCard
            key={subject}
            subject={String(subject)}
            score={quizResults[subject]}
            isLoading={isLoadingQuestions[subject] || false}
            isGenerating={isGenerating[subject] || false}
            onStartQuiz={() => handleStartQuiz(subject)}
            disabled={currentSubject !== null}
          />
        ))}
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
}
