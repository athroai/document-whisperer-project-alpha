
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSubjects } from '@/hooks/useSubjects';
import { ConfidenceLabel } from '@/types/confidence';

export const DiagnosticQuizSelector: React.FC = () => {
  const { subjects, isLoading } = useSubjects();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const navigate = useNavigate();
  
  const handleStartQuiz = () => {
    if (selectedSubject) {
      navigate(`/diagnostic?subject=${encodeURIComponent(selectedSubject)}&confidence=medium`);
    }
  };
  
  if (isLoading) {
    return <div>Loading subjects...</div>;
  }
  
  const confidenceOptions: ConfidenceLabel[] = ['low', 'medium', 'high'];
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="subject-select" className="text-sm font-medium">
          Select a subject to test your knowledge
        </label>
        <Select
          value={selectedSubject}
          onValueChange={setSelectedSubject}
        >
          <SelectTrigger id="subject-select">
            <SelectValue placeholder="Choose a subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        onClick={handleStartQuiz}
        disabled={!selectedSubject}
        className="w-full"
      >
        Start Diagnostic Quiz
      </Button>
    </div>
  );
};
