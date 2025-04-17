
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
import { BookOpen } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';

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
  const { subjects, isLoading } = useSubjects();

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
            <Select value={selectedSubject} onValueChange={onSubjectChange} disabled={isLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading subjects...
                  </SelectItem>
                ) : subjects.length > 0 ? (
                  subjects.filter(subject => subject && subject.trim() !== "").map((subject) => (
                    <SelectItem key={subject} value={subject} className="capitalize">
                      {subject.charAt(0).toUpperCase() + subject.slice(1)}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-subjects" disabled>
                    No subjects available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onStartQuiz(selectedSubject)} 
          className="w-full"
          disabled={!selectedSubject || isLoading}
        >
          Start 5-Question Quiz
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubjectSelector;
