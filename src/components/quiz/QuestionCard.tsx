
import React, { useState } from 'react';
import { Question } from '@/types/quiz';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  onSubmit: (answer: string) => void;
  showFeedback: boolean;
  isCorrect: boolean | null;
  userAnswer: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onSubmit,
  showFeedback,
  isCorrect,
  userAnswer
}) => {
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showFeedback) {
      onSubmit(answer || userAnswer);
    }
  };

  // Make sure we have a valid question object
  if (!question || !question.question) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <p className="text-amber-600">Unable to load question. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{question.question}</CardTitle>
            <CardDescription>
              Topic: {question.topic} • Difficulty: {question.difficulty}/5
            </CardDescription>
          </div>
          {!showFeedback && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1"
            >
              <HelpCircle className="h-4 w-4" />
              <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showHint && !showFeedback && (
          <div className="mb-4 p-3 bg-muted rounded-md text-sm italic">
            <p>Hint: {question.hint}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {question.type === 'multiple-choice' && question.options && (
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    id={`option-${index}`}
                    name="answer"
                    className="mr-2"
                    value={option}
                    checked={showFeedback ? userAnswer === option : answer === option}
                    onChange={() => setAnswer(option)}
                    disabled={showFeedback}
                  />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
          )}

          {question.type === 'short-answer' && (
            <div className="space-y-2">
              <Label htmlFor="answer">Your Answer</Label>
              <Input
                id="answer"
                type="text"
                placeholder="Type your answer here"
                value={showFeedback ? userAnswer : answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={showFeedback}
                className="max-w-md"
              />
            </div>
          )}

          {showFeedback && (
            <div 
              className={`mt-6 p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}
            >
              <div className="flex items-start">
                {isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                )}
                <div>
                  <p className={`font-medium ${isCorrect ? 'text-green-800' : 'text-amber-800'}`}>
                    {isCorrect ? 'Correct!' : 'Not quite right'}
                  </p>
                  <p className="mt-1">
                    {isCorrect 
                      ? `Well done! ${question.hint}`
                      : `The correct answer is "${question.answer}". ${question.hint}`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {!showFeedback && (
            <div className="mt-6">
              <Button 
                type="submit" 
                disabled={!answer && question.type === 'multiple-choice'}
              >
                Submit Answer
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
