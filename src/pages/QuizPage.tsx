
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Question, Answer, mockQuestions } from '@/types/quiz';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

import SubjectSelector from '@/components/quiz/SubjectSelector';
import QuestionCard from '@/components/quiz/QuestionCard';
import QuizSummary from '@/components/quiz/QuizSummary';

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract subject from URL params if present
  const queryParams = new URLSearchParams(location.search);
  const subjectFromParams = queryParams.get('subject');
  
  // State management
  const [subject, setSubject] = useState<string>(subjectFromParams || '');
  const [confidence, setConfidence] = useState<number>(5); // Default to medium
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [quizStarted, setQuizStarted] = useState<boolean>(!!subjectFromParams);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [showConfidenceDialog, setShowConfidenceDialog] = useState<boolean>(false);
  const [confidenceAfter, setConfidenceAfter] = useState<number>(5);
  const [isCurrentAnswerCorrect, setIsCurrentAnswerCorrect] = useState<boolean | null>(null);
  const [currentUserAnswer, setCurrentUserAnswer] = useState<string>('');

  // Load appropriate questions when subject changes
  useEffect(() => {
    if (subject && quizStarted) {
      // Show confidence dialog before starting quiz
      setShowConfidenceDialog(true);
    }
  }, [subject, quizStarted]);

  // Generate quiz questions based on subject and confidence
  const generateQuiz = () => {
    // Filter by subject
    const subjectQuestions = mockQuestions.filter(q => q.subject === subject);
    
    // Determine difficulty range based on confidence
    let minDifficulty = 1;
    let maxDifficulty = 5;
    
    if (confidence >= 1 && confidence <= 4) {
      maxDifficulty = 2; // Easy
    } else if (confidence >= 5 && confidence <= 7) {
      minDifficulty = 3;
      maxDifficulty = 3; // Medium
    } else {
      minDifficulty = 4; // Hard
    }
    
    // Filter by difficulty
    const filteredQuestions = subjectQuestions.filter(
      q => q.difficulty >= minDifficulty && q.difficulty <= maxDifficulty
    );
    
    // Randomize and pick 5 (or fewer if not enough questions)
    const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(5, shuffled.length));
    
    // Handle case where we don't have enough questions of the right difficulty
    if (selected.length < 5 && subjectQuestions.length >= 5) {
      const remaining = shuffled
        .filter(q => !selected.includes(q))
        .slice(0, 5 - selected.length);
      
      selected.push(...remaining);
    }
    
    setQuizQuestions(selected);
    setCurrentIndex(0);
    setAnswers([]);
    setShowFeedback(false);
    setQuizFinished(false);
  };

  const handleConfidenceSubmit = () => {
    setShowConfidenceDialog(false);
    generateQuiz();
  };

  const handleStartQuiz = (selectedSubject: string) => {
    setSubject(selectedSubject);
    setQuizStarted(true);
  };

  const handleAnswerSubmit = (answer: string) => {
    const currentQuestion = quizQuestions[currentIndex];
    const isCorrect = 
      currentQuestion.type === "multiple-choice" 
        ? answer === currentQuestion.answer 
        : answer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim();
    
    // Store the answer
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      userAnswer: answer,
      correct: isCorrect,
      topic: currentQuestion.topic
    };
    
    setIsCurrentAnswerCorrect(isCorrect);
    setCurrentUserAnswer(answer);
    setAnswers([...answers, newAnswer]);
    setShowFeedback(true);
    
    // Show toast for immediate feedback
    if (isCorrect) {
      toast({
        title: "Correct!",
        description: "Well done!",
        className: "bg-green-50 text-green-800 border-green-200",
      });
    } else {
      toast({
        title: "Not quite right",
        description: "Let's look at this more closely.",
        className: "bg-amber-50 text-amber-800 border-amber-200",
      });
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setIsCurrentAnswerCorrect(null);
    setCurrentUserAnswer('');
    
    if (currentIndex < quizQuestions.length - 1) {
      // Move to next question
      setCurrentIndex(currentIndex + 1);
    } else {
      // Quiz is complete
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setQuizStarted(false);
    setSubject('');
    setQuizFinished(false);
    setAnswers([]);
    setQuizQuestions([]);
    setCurrentIndex(0);
    setShowFeedback(false);
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  // Calculate current score
  const calculateScore = () => {
    return answers.filter(answer => answer.correct).length;
  };

  // If we haven't started a quiz yet, show the subject selector
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <img 
              src="/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png" 
              alt="AthroMaths" 
              className="w-12 h-12 mr-4" 
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Athro AI Quiz</h1>
              <p className="text-gray-500">Test your knowledge with a personalized quiz</p>
            </div>
          </div>
          
          <SubjectSelector 
            onStartQuiz={handleStartQuiz}
            selectedSubject={subject}
            onSubjectChange={setSubject}
          />
        </div>
      </div>
    );
  }

  // Show the quiz summary when finished
  if (quizFinished) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <img 
              src="/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png" 
              alt="AthroMaths" 
              className="w-12 h-12 mr-4" 
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Quiz Results</h1>
              <p className="text-gray-500 capitalize">{subject} quiz completed</p>
            </div>
          </div>
          
          <QuizSummary
            subject={subject}
            score={calculateScore()}
            totalQuestions={quizQuestions.length}
            answers={answers}
            questions={quizQuestions}
            confidenceBefore={confidence}
            confidenceAfter={confidenceAfter}
            onStartNewQuiz={handleRestartQuiz}
            onGoHome={handleGoHome}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <img 
            src="/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png" 
            alt="AthroMaths" 
            className="w-12 h-12 mr-4" 
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 capitalize">{subject} Quiz</h1>
            <p className="text-gray-500">Answer 5 questions to test your knowledge</p>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
            <span>Question {currentIndex + 1} of {quizQuestions.length}</span>
            <span>{Math.round(((currentIndex + 1) / quizQuestions.length) * 100)}% Complete</span>
          </div>
          <Progress value={((currentIndex + 1) / quizQuestions.length) * 100} />
        </div>
        
        {quizQuestions.length > 0 && (
          <div className="mb-6">
            <QuestionCard 
              question={quizQuestions[currentIndex]}
              onSubmit={handleAnswerSubmit}
              showFeedback={showFeedback}
              isCorrect={isCurrentAnswerCorrect}
              userAnswer={currentUserAnswer}
            />
          </div>
        )}
        
        {quizQuestions.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-gray-500">
                  No questions available for this subject and difficulty level.
                </p>
                <Button 
                  className="mt-4" 
                  onClick={handleRestartQuiz}
                >
                  Try a Different Subject
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {showFeedback && quizQuestions.length > 0 && (
          <div className="flex justify-end">
            <Button onClick={handleNextQuestion}>
              {currentIndex < quizQuestions.length - 1 ? (
                <>Next Question <ChevronRight className="ml-2 h-4 w-4" /></>
              ) : (
                'Finish Quiz'
              )}
            </Button>
          </div>
        )}
      </div>
      
      {/* Confidence Before Quiz Dialog */}
      <Dialog open={showConfidenceDialog} onOpenChange={setShowConfidenceDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Before we start...</DialogTitle>
            <DialogDescription>
              How confident are you feeling about {subject} today?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Not confident</span>
                  <span>Very confident</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">1</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={confidence}
                    onChange={(e) => setConfidence(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm">10</span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-lg font-medium">{confidence}</span>
                  <span className="text-gray-500">/10</span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleConfidenceSubmit} className="w-full sm:w-auto">
              Start Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizPage;
