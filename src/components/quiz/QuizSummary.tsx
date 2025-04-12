
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Award, Book, ArrowRight, ThumbsUp, AlertTriangle, FileText } from 'lucide-react';
import { Answer, Question } from '@/types/quiz';
import { Slider } from '@/components/ui/slider';
import { markAnswer, getMarkingRecords } from '@/services/markingEngine';
import { useAuth } from '@/contexts/AuthContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MarkingRecord } from '@/types/marking';

interface QuizSummaryProps {
  subject: string;
  score: number;
  totalQuestions: number;
  answers: Answer[];
  questions: Question[];
  confidenceBefore: number;
  confidenceAfter: number;
  onConfidenceAfterChange: (value: number) => void;
  onStartNewQuiz: () => void;
  onGoHome: () => void;
  onComplete: () => void;
}

const QuizSummary: React.FC<QuizSummaryProps> = ({
  subject, 
  score, 
  totalQuestions,
  answers,
  questions,
  confidenceBefore,
  confidenceAfter,
  onConfidenceAfterChange,
  onStartNewQuiz,
  onGoHome,
  onComplete
}) => {
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const percentage = Math.round((score / totalQuestions) * 100);
  const [markingRecords, setMarkingRecords] = useState<MarkingRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const { state } = useAuth();
  
  // Process answers for marking engine
  useEffect(() => {
    const processAnswers = async () => {
      if (isCompleted || !state.user?.id) return;
      
      try {
        // Submit each answer to the marking engine
        for (let i = 0; i < answers.length; i++) {
          const answer = answers[i];
          const question = questions.find(q => q.id === answer.questionId);
          
          if (question) {
            await markAnswer({
              prompt: question.text,
              answer: answer.text || "No answer provided",
              subject,
              topic: question.topic,
              userId: state.user.id,
              sourceType: 'quiz'
            });
          }
        }
      } catch (error) {
        console.error("Error processing quiz answers for marking:", error);
      }
    };

    processAnswers();
  }, [answers, questions, subject, isCompleted, state.user?.id]);
  
  // Fetch marking records
  useEffect(() => {
    const fetchMarkingRecords = async () => {
      if (!state.user?.id) return;
      
      setIsLoadingRecords(true);
      try {
        const records = await getMarkingRecords({
          studentId: state.user.id,
          subject: subject.toLowerCase()
        });
        
        // Only show the most recent records that match this quiz
        const quizRecords = records
          .filter(r => r.source === 'quiz')
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, totalQuestions);
          
        setMarkingRecords(quizRecords);
      } catch (error) {
        console.error("Error fetching marking records:", error);
      } finally {
        setIsLoadingRecords(false);
      }
    };
    
    fetchMarkingRecords();
  }, [state.user?.id, subject, totalQuestions]);
  
  // Complete the quiz when user submits final confidence
  const handleComplete = () => {
    if (!isCompleted) {
      onComplete();
      setIsCompleted(true);
    }
  };
  
  // Call handleComplete when component unmounts if not already completed
  useEffect(() => {
    return () => {
      if (!isCompleted) {
        onComplete();
      }
    };
  }, [isCompleted, onComplete]);
  
  // Calculate topic performance
  const topicPerformance: Record<string, { correct: number, total: number }> = {};
  
  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    if (question) {
      const topic = question.topic;
      if (!topicPerformance[topic]) {
        topicPerformance[topic] = { correct: 0, total: 0 };
      }
      topicPerformance[topic].total += 1;
      if (answer.correct) {
        topicPerformance[topic].correct += 1;
      }
    }
  });

  // Find best and weakest topics
  let bestTopic = "";
  let weakestTopic = "";
  let bestScore = 0;
  let weakestScore = 1;

  for (const [topic, performance] of Object.entries(topicPerformance)) {
    const score = performance.correct / performance.total;
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
    if (score < weakestScore) {
      weakestScore = score;
      weakestTopic = topic;
    }
  }

  // Generate a suggestion based on results
  const getSuggestion = () => {
    if (percentage >= 80) {
      return `Great job! You've mastered ${subject}. Consider trying more difficult questions or exploring advanced concepts in ${weakestTopic}.`;
    } else if (percentage >= 60) {
      return `Good work! Review ${weakestTopic} to improve your understanding and try another quiz to test your knowledge.`;
    } else {
      return `Keep practicing! Focus on ${weakestTopic} and consider reviewing the basics before taking another quiz.`;
    }
  };

  // Get character name based on subject
  const getAthroName = () => {
    const subjectLower = subject.toLowerCase();
    if (subjectLower.includes('math')) return 'AthroMaths';
    if (subjectLower.includes('science')) return 'AthroScience';
    return 'Athro AI';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Quiz Results</CardTitle>
        <CardDescription className="text-center">
          {percentage >= 80 
            ? "Excellent work! You're mastering this material."
            : percentage >= 60
              ? "Good job! Keep practicing to improve your score."
              : "You're making progress! Let's review the areas you struggled with."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-700">{percentage}%</div>
              <div className="text-sm text-purple-600">Score</div>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <p className="font-medium text-gray-700">
            You answered {score} out of {totalQuestions} questions correctly
          </p>
          
          <div className="mt-6 flex justify-center">
            {percentage >= 80 ? (
              <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-full">
                <Award className="mr-2 h-5 w-5" />
                <span className="font-medium">Excellent Performance</span>
              </div>
            ) : percentage >= 60 ? (
              <div className="flex items-center text-amber-600 bg-amber-50 px-4 py-2 rounded-full">
                <ThumbsUp className="mr-2 h-5 w-5" />
                <span className="font-medium">Good Progress</span>
              </div>
            ) : (
              <div className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                <Book className="mr-2 h-5 w-5" />
                <span className="font-medium">Keep Practicing</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Strongest Topic: <span className="font-medium text-green-600">{bestTopic}</span></span>
              <span>{Math.round(bestScore * 100)}%</span>
            </div>
            <Progress value={bestScore * 100} className="h-2 bg-gray-100" />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Needs Improvement: <span className="font-medium text-amber-600">{weakestTopic}</span></span>
              <span>{Math.round(weakestScore * 100)}%</span>
            </div>
            <Progress value={weakestScore * 100} className="h-2 bg-gray-100" />
          </div>
        </div>

        {/* AI Feedback Section */}
        {markingRecords.length > 0 && (
          <Collapsible className="border rounded-lg">
            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-medium">View Detailed Feedback</span>
              </div>
              <span className="text-xs text-gray-500">
                {markingRecords.length} item{markingRecords.length !== 1 ? 's' : ''}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3 p-4 border-t">
                {markingRecords.map((record, index) => (
                  <div key={record.id} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-sm">Question {index + 1}</div>
                      <div className="text-sm font-medium">
                        Score: {record.aiMark.score}/{record.aiMark.outOf}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{record.originalPrompt}</p>
                    <div className="mt-2 text-xs text-gray-500">Your answer:</div>
                    <p className="text-sm mt-1">{record.studentAnswer}</p>
                    <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
                      <span className="font-medium">Feedback: </span>
                      {record.teacherMark ? record.teacherMark.comment : record.aiMark.comment}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-800">{getAthroName()} suggests:</p>
              <p className="mt-1 text-blue-700">{getSuggestion()}</p>
            </div>
          </div>
        </div>
        
        {/* Confidence comparison */}
        <div className="pt-4 border-t">
          <h4 className="text-center font-medium mb-4">How confident are you feeling now?</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Before: {confidenceBefore}/10</span>
                <span>After: {confidenceAfter}/10</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm">1</span>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[confidenceAfter]}
                  onValueChange={(value) => onConfidenceAfterChange(value[0])}
                  className="flex-1"
                />
                <span className="text-sm">10</span>
              </div>
              <div className="text-center mt-2">
                <span className="text-lg font-medium">{confidenceAfter}</span>
                <span className="text-gray-500">/10</span>
              </div>
              <div className="relative h-2 mt-4 rounded-full bg-gray-100">
                <div 
                  className={`absolute h-full rounded-full ${
                    confidenceAfter > confidenceBefore 
                      ? "bg-green-500" 
                      : confidenceAfter < confidenceBefore 
                        ? "bg-amber-500" 
                        : "bg-blue-500"
                  }`}
                  style={{width: `${(confidenceAfter / 10) * 100}%`}}
                ></div>
                <div className="absolute bottom-0 h-4 w-0.5 bg-gray-700" 
                     style={{left: `${(confidenceBefore / 10) * 100}%`, transform: 'translateX(-50%)'}}></div>
              </div>
              <div className="text-center mt-4 text-sm text-gray-500">
                {confidenceAfter > confidenceBefore 
                  ? "Your confidence has increased! Great progress." 
                  : confidenceAfter < confidenceBefore 
                    ? "Your confidence has decreased. More practice will help." 
                    : "Your confidence level is unchanged."}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-4 pt-2">
        <Button variant="outline" onClick={() => {
          handleComplete();
          onGoHome();
        }}>
          Return Home
        </Button>
        <Button onClick={() => {
          handleComplete();
          onStartNewQuiz();
        }}>
          Try Another Quiz
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizSummary;
