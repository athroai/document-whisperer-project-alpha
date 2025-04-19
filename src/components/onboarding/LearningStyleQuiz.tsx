
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface LearningStyleQuestion {
  id: string;
  text: string;
  visualScore: number;
  auditoryScore: number;
  readingScore: number;
  kinestheticScore: number;
}

interface LearningStyle {
  visual: number;
  auditory: number;
  reading: number;
  kinesthetic: number;
}

const questions: LearningStyleQuestion[] = [
  {
    id: 'q1',
    text: 'When learning something new, I prefer to:',
    visualScore: 3,
    auditoryScore: 0,
    readingScore: 1,
    kinestheticScore: 2
  },
  {
    id: 'q2',
    text: 'When studying, I find it easiest to remember:',
    visualScore: 3,
    auditoryScore: 2,
    readingScore: 1,
    kinestheticScore: 0
  },
  {
    id: 'q3',
    text: 'I understand concepts best when:',
    visualScore: 1,
    auditoryScore: 3,
    readingScore: 0,
    kinestheticScore: 2
  },
  {
    id: 'q4',
    text: 'When taking notes, I prefer to:',
    visualScore: 2,
    auditoryScore: 0,
    readingScore: 3,
    kinestheticScore: 1
  },
  {
    id: 'q5',
    text: 'I learn best when:',
    visualScore: 1,
    auditoryScore: 2,
    readingScore: 0,
    kinestheticScore: 3
  }
];

interface LearningStyleQuizProps {
  onComplete: (results: LearningStyle) => void;
}

const LearningStyleQuiz: React.FC<LearningStyleQuizProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<LearningStyle | null>(null);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    let visual = 0;
    let auditory = 0;
    let reading = 0;
    let kinesthetic = 0;

    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      switch (answer) {
        case 'visual':
          visual += question.visualScore;
          break;
        case 'auditory':
          auditory += question.auditoryScore;
          break;
        case 'reading':
          reading += question.readingScore;
          break;
        case 'kinesthetic':
          kinesthetic += question.kinestheticScore;
          break;
      }
    });

    const learningStyle = {
      visual,
      auditory,
      reading,
      kinesthetic
    };

    setResults(learningStyle);
    onComplete(learningStyle);
  };

  const getCurrentQuestion = () => questions[currentQuestion];

  return (
    <Card className="w-full mt-4">
      <CardContent className="pt-4">
        {!results ? (
          <>
            <h3 className="font-bold text-lg mb-4">Learning Style Quiz ({currentQuestion + 1}/{questions.length})</h3>
            <p className="mb-4">{getCurrentQuestion().text}</p>

            <RadioGroup 
              value={answers[getCurrentQuestion().id]} 
              onValueChange={(value) => handleAnswer(getCurrentQuestion().id, value)}
              className="mb-4"
            >
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="visual" id={`visual-${getCurrentQuestion().id}`} />
                <Label htmlFor={`visual-${getCurrentQuestion().id}`}>Using diagrams, charts, or videos</Label>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="auditory" id={`auditory-${getCurrentQuestion().id}`} />
                <Label htmlFor={`auditory-${getCurrentQuestion().id}`}>Listening to explanations or discussions</Label>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="reading" id={`reading-${getCurrentQuestion().id}`} />
                <Label htmlFor={`reading-${getCurrentQuestion().id}`}>Reading textbooks or written materials</Label>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="kinesthetic" id={`kinesthetic-${getCurrentQuestion().id}`} />
                <Label htmlFor={`kinesthetic-${getCurrentQuestion().id}`}>Hands-on activities or practical examples</Label>
              </div>
            </RadioGroup>

            <Button 
              onClick={handleNext} 
              disabled={!answers[getCurrentQuestion().id]}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
            </Button>
          </>
        ) : (
          <div className="text-center">
            <h3 className="font-bold text-lg mb-2">Your Learning Style Results</h3>
            <p className="mb-4">Based on your answers, here's your learning style profile:</p>
            
            <div className="space-y-2 mb-4">
              <div>
                <span className="font-medium">Visual Learning:</span> {results.visual} points
                <div className="h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-2 bg-blue-500 rounded-full" 
                    style={{ width: `${(results.visual / 15) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <span className="font-medium">Auditory Learning:</span> {results.auditory} points
                <div className="h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-2 bg-green-500 rounded-full" 
                    style={{ width: `${(results.auditory / 15) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <span className="font-medium">Reading/Writing:</span> {results.reading} points
                <div className="h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-2 bg-yellow-500 rounded-full" 
                    style={{ width: `${(results.reading / 15) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <span className="font-medium">Kinesthetic Learning:</span> {results.kinesthetic} points
                <div className="h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-2 bg-purple-500 rounded-full" 
                    style={{ width: `${(results.kinesthetic / 15) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LearningStyleQuiz;
