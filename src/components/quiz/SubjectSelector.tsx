
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Brain } from 'lucide-react';
import { subjectList } from '@/types/quiz';

interface SubjectSelectorProps {
  onStartQuiz: (subject: string) => void;
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ 
  onStartQuiz, 
  selectedSubject, 
  onSubjectChange 
}) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <span>Start a Quick Quiz</span>
        </CardTitle>
        <CardDescription>
          Test your knowledge with a 5-question quiz tailored to your confidence level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="subject-select" className="block text-sm font-medium mb-2">
              Select Subject
            </label>
            <Select value={selectedSubject} onValueChange={onSubjectChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjectList.map((subject) => (
                  <SelectItem key={subject} value={subject} className="capitalize">
                    {subject.charAt(0).toUpperCase() + subject.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-4 bg-purple-50 p-4 rounded-md border border-purple-100">
            <h3 className="text-sm font-medium text-purple-800 mb-2">What to expect:</h3>
            <ul className="text-sm text-purple-700 list-disc pl-5 space-y-1">
              <li>5 engaging questions tailored to GCSE level</li>
              <li>Immediate feedback after each answer</li>
              <li>Detailed explanations for correct and incorrect answers</li>
              <li>Performance summary at the end</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onStartQuiz(selectedSubject)} 
          className="w-full"
          disabled={!selectedSubject}
        >
          Start 5-Question Quiz
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubjectSelector;
