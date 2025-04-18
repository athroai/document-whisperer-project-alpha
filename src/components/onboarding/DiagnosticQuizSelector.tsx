
import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useSubjects } from '@/hooks/useSubjects';
import { useQuiz } from '@/hooks/useQuiz';
import { SubjectQuizCard } from './quiz/SubjectQuizCard';
import { QuizQuestion } from './quiz/QuizQuestion';
import { useToast } from '@/hooks/use-toast';

export const DiagnosticQuizSelector: React.FC = () => {
  const { toast: uiToast } = useToast();
  const { selectedSubjects, updateOnboardingStep } = useOnboarding();
  const { subjects, isLoading: isLoadingSubjects } = useSubjects();
  const [selectedConfidence, setSelectedConfidence] = useState<string | number>(5);
  
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

  const handleConfidenceChange = (newValue: (string | number)[]) => {
    const value = newValue?.[0] ?? 5;
    setSelectedConfidence(value);
  };

  const handleStartQuiz = (subject: string) => {
    const subjectPreference = selectedSubjects?.find(s => s.subject === subject);
    const confidence = Number(subjectPreference?.confidence || selectedConfidence);
    startQuiz(subject, confidence);
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
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div>
        <p className="mb-4">Take these quick diagnostic quizzes to help us create a personalized study plan:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {subjectsToShow.map((subject) => (
            <SubjectQuizCard
              key={subject}
              subject={subject}
              score={quizResults[subject]}
              isLoading={isLoadingQuestions[subject] || false}
              isGenerating={isGenerating[subject] || false}
              onStartQuiz={() => handleStartQuiz(subject)}
              disabled={currentSubject !== null}
            />
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
