
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface LearningStyle {
  visual: number;
  auditory: number;
  reading: number;
  kinesthetic: number;
}

interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    type: keyof LearningStyle;
  }[];
}

interface LearningStyleQuizProps {
  onComplete: (styles: LearningStyle) => void;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "When learning a new topic, I prefer to:",
    options: [
      { text: "Watch videos or demonstrations", type: "visual" },
      { text: "Listen to someone explain it", type: "auditory" },
      { text: "Read about it in a book or article", type: "reading" },
      { text: "Try it out myself through practice", type: "kinesthetic" }
    ]
  },
  {
    id: 2,
    text: "I remember information best when:",
    options: [
      { text: "I see diagrams, charts or pictures", type: "visual" },
      { text: "I hear someone explain it", type: "auditory" },
      { text: "I write it down or read it", type: "reading" },
      { text: "I do a hands-on activity", type: "kinesthetic" }
    ]
  },
  {
    id: 3,
    text: "When studying for an exam, I typically:",
    options: [
      { text: "Create mind maps or visual summaries", type: "visual" },
      { text: "Record myself reading notes and listen back", type: "auditory" },
      { text: "Write out notes and reread them", type: "reading" },
      { text: "Use flashcards or practice problems", type: "kinesthetic" }
    ]
  },
  {
    id: 4,
    text: "When I need to concentrate, I prefer:",
    options: [
      { text: "A clean, organized space with visual aids", type: "visual" },
      { text: "A quiet environment or background music", type: "auditory" },
      { text: "Having all my notes and books organized", type: "reading" },
      { text: "Moving around or having something to fidget with", type: "kinesthetic" }
    ]
  },
  {
    id: 5,
    text: "I find it easiest to follow:",
    options: [
      { text: "Visual instructions with diagrams", type: "visual" },
      { text: "Verbal instructions and explanations", type: "auditory" },
      { text: "Written step-by-step instructions", type: "reading" },
      { text: "Demonstrations I can try myself", type: "kinesthetic" }
    ]
  }
];

const LearningStyleQuiz: React.FC<LearningStyleQuizProps> = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, keyof LearningStyle>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [scores, setScores] = useState<LearningStyle>({
    visual: 0,
    auditory: 0,
    reading: 0,
    kinesthetic: 0
  });

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

  const handleOptionSelect = (type: keyof LearningStyle) => {
    setSelectedOption(type);
    setAnswers({
      ...answers,
      [currentQuestion.id]: type
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      // Calculating final scores
      const finalScores = { ...scores };
      Object.values(answers).forEach(type => {
        finalScores[type]++;
      });
      
      // Normalize scores to percentages
      const total = Object.values(finalScores).reduce((sum, score) => sum + score, 0);
      
      const normalizedScores: LearningStyle = {
        visual: Math.round((finalScores.visual / total) * 100),
        auditory: Math.round((finalScores.auditory / total) * 100),
        reading: Math.round((finalScores.reading / total) * 100),
        kinesthetic: Math.round((finalScores.kinesthetic / total) * 100)
      };
      
      setScores(normalizedScores);
      onComplete(normalizedScores);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-4">
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Question {currentQuestionIndex + 1} of {QUESTIONS.length}
          </p>
        </div>

        <h3 className="text-lg font-medium mb-4">{currentQuestion.text}</h3>
        
        <RadioGroup value={selectedOption || ""} className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={option.type} 
                id={`option-${index}`} 
                onClick={() => handleOptionSelect(option.type)}
              />
              <Label htmlFor={`option-${index}`} className="cursor-pointer">
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <Button 
          onClick={handleNext} 
          disabled={!selectedOption}
          className="w-full mt-6"
        >
          {currentQuestionIndex < QUESTIONS.length - 1 ? 'Next Question' : 'Complete Quiz'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LearningStyleQuiz;
