
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Question } from '@/types/quiz';

interface QuizQuestionProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswerId?: string;
  onAnswerSelect: (answerId: string) => void;
  onNextQuestion: () => void;
  subject: string;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswerId,
  onAnswerSelect,
  onNextQuestion,
  subject
}) => {
  const isAnswerSelected = selectedAnswerId !== undefined;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{subject} Diagnostic Quiz</h3>
        <span className="text-sm text-gray-500">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
      </div>

      <Progress value={((currentIndex + 1) / totalQuestions) * 100} className="h-2" />

      <div className="p-6 bg-white rounded-lg shadow">
        <h4 className="text-xl font-medium mb-4">{question?.text || "Loading question..."}</h4>
        
        <div className="space-y-3 mt-6">
          {question?.options && Array.isArray(question.options) && question.options.length > 0 ? (
            question.options.map((option, index) => (
              <button
                key={`option-${index}`}
                onClick={() => onAnswerSelect(`option-${index}`)}
                className={`p-4 w-full border rounded-lg text-left transition-all ${
                  selectedAnswerId === `option-${index}` 
                    ? 'border-purple-600 bg-purple-50' 
                    : 'hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                {option}
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
            onClick={onNextQuestion}
            disabled={!isAnswerSelected}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLastQuestion ? "Finish Quiz" : "Next Question"}
          </Button>
        </div>
      </div>
    </div>
  );
};
