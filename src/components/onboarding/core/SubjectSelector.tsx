
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Check } from 'lucide-react';

// Common GCSE subjects
const COMMON_SUBJECTS = [
  'Mathematics',
  'English Language',
  'English Literature',
  'Biology',
  'Chemistry',
  'Physics',
  'Combined Science',
  'History',
  'Geography',
  'French',
  'Spanish',
  'German',
  'Computer Science',
  'Art & Design',
  'Religious Studies',
  'Physical Education',
  'Music',
  'Drama',
  'Business Studies'
];

type ConfidenceLevel = 'low' | 'medium' | 'high';
type SubjectInfo = { subject: string; confidence: ConfidenceLevel };

interface SubjectSelectorProps {
  subjects: SubjectInfo[];
  updateSubjects: (subjects: SubjectInfo[]) => void;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({ subjects, updateSubjects }) => {
  const [customSubject, setCustomSubject] = useState('');
  
  const isSubjectSelected = (subject: string) => subjects.some(s => s.subject === subject);
  
  const addSubject = (subject: string) => {
    if (!isSubjectSelected(subject)) {
      updateSubjects([...subjects, { subject, confidence: 'medium' }]);
    }
  };
  
  const removeSubject = (subject: string) => {
    updateSubjects(subjects.filter(s => s.subject !== subject));
  };
  
  const updateConfidence = (subject: string, confidence: ConfidenceLevel) => {
    updateSubjects(
      subjects.map(s => (s.subject === subject ? { ...s, confidence } : s))
    );
  };
  
  const handleCustomSubjectAdd = () => {
    if (customSubject.trim() && !isSubjectSelected(customSubject)) {
      addSubject(customSubject);
      setCustomSubject('');
    }
  };
  
  const getConfidenceColor = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
    }
  };
  
  const getConfidenceLabel = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case 'low': return 'Need More Help';
      case 'medium': return 'Somewhat Confident';
      case 'high': return 'Very Confident';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Your Subjects</h2>
        <p className="text-gray-600">
          Choose the subjects you're studying for your GCSEs. For each subject, indicate your confidence level.
        </p>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Common GCSE Subjects</h3>
        <div className="flex flex-wrap gap-2">
          {COMMON_SUBJECTS.map(subject => (
            <Button
              key={subject}
              variant={isSubjectSelected(subject) ? "secondary" : "outline"}
              size="sm"
              onClick={() => isSubjectSelected(subject) ? removeSubject(subject) : addSubject(subject)}
              className={isSubjectSelected(subject) ? "bg-purple-100 text-purple-800 border-purple-200" : ""}
            >
              {subject}
              {isSubjectSelected(subject) && <X className="ml-1 h-3 w-3" />}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Add Custom Subject</h3>
        <div className="flex gap-2">
          <Input
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            placeholder="Enter subject name"
            className="flex-1"
          />
          <Button
            onClick={handleCustomSubjectAdd}
            variant="outline"
            disabled={!customSubject.trim()}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>
      
      {subjects.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Your Selected Subjects</h3>
          <p className="text-sm text-gray-500">
            For each subject, select your confidence level. We'll focus more on subjects where you need help.
          </p>
          
          <div className="space-y-3">
            {subjects.map(({ subject, confidence }) => (
              <Card key={subject} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="font-medium">{subject}</div>
                  <div className="flex flex-wrap gap-2">
                    {(['low', 'medium', 'high'] as ConfidenceLevel[]).map((level) => (
                      <Button
                        key={level}
                        size="sm"
                        variant={confidence === level ? "default" : "outline"}
                        className={confidence === level ? getConfidenceColor(level) : ""}
                        onClick={() => updateConfidence(subject, level)}
                      >
                        {confidence === level && <Check className="mr-1 h-3 w-3" />}
                        {getConfidenceLabel(level)}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-medium text-blue-800">Selected subjects: {subjects.length}</h4>
            <div className="mt-2 flex flex-wrap gap-1">
              {subjects.map(({ subject, confidence }) => (
                <Badge key={subject} variant="secondary" className={getConfidenceColor(confidence)}>
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {subjects.length === 0 && (
        <div className="bg-amber-50 p-4 rounded-md text-amber-800">
          Please select at least one subject to continue.
        </div>
      )}
    </div>
  );
};
