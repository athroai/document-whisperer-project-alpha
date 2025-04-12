
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, CheckCircle2, Award, AlertCircle, ThumbsUp } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

type QuestionType = 'multiple-choice' | 'text-input' | 'true-false';

interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options?: string[];
  answer: string | string[];
  feedback?: {
    correct: string;
    incorrect: string;
  };
}

const QuizPage: React.FC = () => {
  // Sample quiz data
  const quizQuestions: Question[] = [
    {
      id: 1,
      text: "What is the formula for calculating the area of a circle?",
      type: "multiple-choice",
      options: ["πr²", "2πr", "πr³", "πr²/2"],
      answer: "πr²",
      feedback: {
        correct: "Excellent! The area of a circle is indeed πr², where r is the radius.",
        incorrect: "Not quite. The formula for the area of a circle is πr², where r is the radius. The formula 2πr calculates the circumference."
      }
    },
    {
      id: 2,
      text: "If y = 3x + 4 and x = 2, what is the value of y?",
      type: "text-input",
      answer: "10",
      feedback: {
        correct: "Perfect! When x = 2, y = 3(2) + 4 = 6 + 4 = 10.",
        incorrect: "Let's try again. To find y when x = 2, substitute into the equation: y = 3x + 4 = 3(2) + 4 = 6 + 4 = 10."
      }
    },
    {
      id: 3,
      text: "The quadratic formula is used to solve linear equations.",
      type: "true-false",
      options: ["True", "False"],
      answer: "False",
      feedback: {
        correct: "Correct! The quadratic formula is used to solve quadratic equations (ax² + bx + c = 0), not linear equations.",
        incorrect: "That's not right. The quadratic formula is specifically used to solve quadratic equations (ax² + bx + c = 0). Linear equations (ax + b = 0) are solved using different methods."
      }
    },
    {
      id: 4,
      text: "Solve for x: 2x + 5 = 15",
      type: "text-input",
      answer: "5",
      feedback: {
        correct: "Great work! To solve 2x + 5 = 15, you subtract 5 from both sides to get 2x = 10, then divide by 2 to get x = 5.",
        incorrect: "Let's work through this step by step. To solve 2x + 5 = 15, first subtract 5 from both sides: 2x = 10. Then divide both sides by 2: x = 5."
      }
    },
    {
      id: 5,
      text: "Which of the following are prime numbers? (Select all that apply)",
      type: "multiple-choice",
      options: ["9", "11", "17", "21"],
      answer: ["11", "17"],
      feedback: {
        correct: "Perfect! 11 and 17 are indeed prime numbers, as they are only divisible by 1 and themselves.",
        incorrect: "Not quite right. Among these numbers, only 11 and 17 are prime numbers (divisible only by 1 and themselves). 9 is divisible by 3 (9 = 3 × 3) and 21 is divisible by 3 and 7 (21 = 3 × 7)."
      }
    }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [confidenceBefore, setConfidenceBefore] = useState(5);
  const [confidenceAfter, setConfidenceAfter] = useState(5);
  const [showConfidenceDialog, setShowConfidenceDialog] = useState(true);
  
  const isLastQuestion = currentStep === quizQuestions.length - 1;
  const currentQuestion = quizQuestions[currentStep];
  
  const checkAnswer = () => {
    const userAnswer = answers[currentQuestion.id];
    let correct = false;
    
    if (Array.isArray(currentQuestion.answer) && Array.isArray(userAnswer)) {
      // For multiple select questions
      correct = userAnswer.length === currentQuestion.answer.length && 
                userAnswer.every(val => currentQuestion.answer.includes(val));
    } else if (userAnswer === currentQuestion.answer) {
      correct = true;
    }
    
    setIsAnswerCorrect(correct);
    setShowFeedback(true);
    
    // Show toast for immediate feedback
    if (correct) {
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
    
    return correct;
  };
  
  const handleNextQuestion = () => {
    if (showFeedback) {
      setShowFeedback(false);
      
      if (isLastQuestion) {
        setQuizCompleted(true);
        setShowResults(true);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      checkAnswer();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentStep > 0) {
      setShowFeedback(false);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnswerChange = (value: string | string[]) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value
    });
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    
    quizQuestions.forEach(question => {
      const userAnswer = answers[question.id];
      
      if (Array.isArray(question.answer) && Array.isArray(userAnswer)) {
        // For multiple select questions
        if (userAnswer.length === question.answer.length && 
            userAnswer.every(val => question.answer.includes(val))) {
          correctAnswers++;
        }
      } else if (userAnswer === question.answer) {
        correctAnswers++;
      }
    });
    
    return {
      score: correctAnswers,
      total: quizQuestions.length,
      percentage: Math.round((correctAnswers / quizQuestions.length) * 100)
    };
  };

  const handleConfidenceSubmit = () => {
    setShowConfidenceDialog(false);
  };

  const renderQuestionInput = () => {
    const question = currentQuestion;
    
    switch(question.type) {
      case 'multiple-choice':
        if (Array.isArray(question.answer)) {
          // Multiple select question
          return (
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`option-${index}`}
                    checked={Array.isArray(answers[question.id]) && 
                      (answers[question.id] as string[]).includes(option)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        const currentAnswers = Array.isArray(answers[question.id]) 
                          ? [...answers[question.id] as string[]] 
                          : [];
                        handleAnswerChange([...currentAnswers, option]);
                      } else {
                        const currentAnswers = Array.isArray(answers[question.id]) 
                          ? (answers[question.id] as string[]).filter(a => a !== option) 
                          : [];
                        handleAnswerChange(currentAnswers);
                      }
                    }}
                    disabled={showFeedback}
                  />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
          );
        } else {
          // Single select question
          return (
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    id={`option-${index}`}
                    name={`question-${question.id}`}
                    value={option}
                    className="mr-2"
                    checked={answers[question.id] === option}
                    onChange={() => handleAnswerChange(option)}
                    disabled={showFeedback}
                  />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
          );
        }
        
      case 'text-input':
        return (
          <Input
            type="text"
            value={answers[question.id] as string || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Enter your answer"
            className="max-w-sm"
            disabled={showFeedback}
          />
        );
        
      case 'true-false':
        return (
          <div className="flex space-x-4">
            <Button 
              variant={answers[question.id] === 'True' ? 'default' : 'outline'}
              onClick={() => handleAnswerChange('True')}
              disabled={showFeedback}
            >
              True
            </Button>
            <Button
              variant={answers[question.id] === 'False' ? 'default' : 'outline'}
              onClick={() => handleAnswerChange('False')}
              disabled={showFeedback}
            >
              False
            </Button>
          </div>
        );
        
      default:
        return null;
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-800">Mathematics Quick Quiz</h1>
            <p className="text-gray-500">Test your knowledge with AthroMaths</p>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
            <span>Question {currentStep + 1} of {quizQuestions.length}</span>
            <span>{Math.round(((currentStep + 1) / quizQuestions.length) * 100)}% Complete</span>
          </div>
          <Progress value={((currentStep + 1) / quizQuestions.length) * 100} />
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Question {currentStep + 1}</CardTitle>
            <CardDescription>
              {currentQuestion.type === 'multiple-choice' && Array.isArray(currentQuestion.answer) 
                ? 'Select all that apply' 
                : currentQuestion.type === 'multiple-choice' 
                  ? 'Select one answer' 
                  : currentQuestion.type === 'text-input' 
                    ? 'Enter your answer' 
                    : 'True or False'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-6">{currentQuestion.text}</p>
            {renderQuestionInput()}
            
            {showFeedback && (
              <div className={`mt-6 p-4 rounded-lg ${isAnswerCorrect ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                <div className="flex items-start">
                  {isAnswerCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`font-medium ${isAnswerCorrect ? 'text-green-800' : 'text-amber-800'}`}>
                      {isAnswerCorrect ? 'Correct!' : 'Not quite right'}
                    </p>
                    <p className="mt-1 text-sm">
                      {isAnswerCorrect 
                        ? currentQuestion.feedback?.correct 
                        : currentQuestion.feedback?.incorrect}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentStep === 0 || showFeedback}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={handleNextQuestion}
              disabled={answers[currentQuestion.id] === undefined && !showFeedback}
            >
              {showFeedback 
                ? isLastQuestion 
                  ? 'Finish Quiz' 
                  : 'Next Question' 
                : 'Check Answer'}
              {!showFeedback ? <ThumbsUp className="ml-2 h-4 w-4" /> : 
               !isLastQuestion && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Confidence Before Quiz Dialog */}
      <Dialog open={showConfidenceDialog} onOpenChange={setShowConfidenceDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Before we start...</DialogTitle>
            <DialogDescription>
              How confident are you feeling about this topic today?
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
                    value={confidenceBefore}
                    onChange={(e) => setConfidenceBefore(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm">10</span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-lg font-medium">{confidenceBefore}</span>
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
      
      {/* Quiz Results Modal */}
      <Dialog open={showResults} onOpenChange={(open) => {
        setShowResults(open);
        if (!open) {
          setShowConfidenceDialog(false);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Quiz Results</DialogTitle>
            <DialogDescription className="text-center">
              {calculateScore().percentage >= 80 
                ? "Excellent work! You're mastering this material."
                : calculateScore().percentage >= 60
                  ? "Good job! Keep practicing to improve your score."
                  : "You're making progress! Let's review the areas you struggled with."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-700">{calculateScore().percentage}%</div>
                  <div className="text-sm text-purple-600">Score</div>
                </div>
              </div>
            </div>
            
            <div className="text-center mb-6">
              <p className="font-medium text-gray-700">
                You answered {calculateScore().score} out of {calculateScore().total} questions correctly
              </p>
              
              <div className="mt-6 flex justify-center">
                {calculateScore().percentage >= 80 ? (
                  <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-full">
                    <Award className="mr-2 h-5 w-5" />
                    <span className="font-medium">Excellent Performance</span>
                  </div>
                ) : calculateScore().percentage >= 60 ? (
                  <div className="flex items-center text-amber-600 bg-amber-50 px-4 py-2 rounded-full">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    <span className="font-medium">Good Progress</span>
                  </div>
                ) : (
                  <div className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    <span className="font-medium">Keep Practicing</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* After-quiz confidence check */}
            <div className="mb-6 border-t pt-4">
              <h4 className="text-center font-medium mb-4">How confident do you feel now?</h4>
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
                    value={confidenceAfter}
                    onChange={(e) => setConfidenceAfter(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm">10</span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-lg font-medium">{confidenceAfter}</span>
                  <span className="text-gray-500">/10</span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row sm:justify-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowResults(false);
                setQuizCompleted(false);
                setCurrentStep(0);
                setAnswers({});
                setShowConfidenceDialog(true);
              }}
            >
              Try Another Quiz
            </Button>
            <Button
              onClick={() => {
                setShowResults(false);
                setQuizCompleted(false);
                setCurrentStep(0);
              }}
            >
              Review Answers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizPage;
