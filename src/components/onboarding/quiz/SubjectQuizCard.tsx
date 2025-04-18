
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle, Loader2, RefreshCw } from 'lucide-react';

interface SubjectQuizCardProps {
  subject: string;
  score?: number;
  isLoading: boolean;
  isGenerating: boolean;
  onStartQuiz: () => void;
  disabled: boolean;
}

export const SubjectQuizCard: React.FC<SubjectQuizCardProps> = ({
  subject,
  score,
  isLoading,
  isGenerating,
  onStartQuiz,
  disabled
}) => {
  const completed = score !== undefined;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
            <h4 className="text-lg font-medium">{subject}</h4>
          </div>
          
          {completed ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-1" />
              <span>{score}% Score</span>
            </div>
          ) : (
            <Button 
              variant={isLoading ? "outline" : "default"}
              disabled={isLoading || disabled}
              onClick={onStartQuiz}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating</>
              ) : isLoading ? (
                <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading</>
              ) : (
                'Take Quiz'
              )}
            </Button>
          )}
        </div>
        
        {completed && (
          <Progress value={score} className="mt-3" />
        )}
      </CardContent>
    </Card>
  );
};
