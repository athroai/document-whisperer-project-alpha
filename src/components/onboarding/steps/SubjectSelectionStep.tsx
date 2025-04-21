
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SubjectConfidenceSelector } from '../SubjectConfidenceSelector';
import { ConfidenceLabel } from '@/types/confidence';

const COMMON_SUBJECTS = [
  'Mathematics',
  'English',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Geography',
  'Computer Science',
  'French',
  'Spanish',
  'German',
  'Art',
  'Music',
  'Physical Education',
  'Religious Studies'
];

export const SubjectSelectionStep: React.FC = () => {
  const { selectedSubjects, selectSubject, removeSubject, updateOnboardingStep } = useOnboarding();
  const [customSubject, setCustomSubject] = useState('');
  const [currentConfidence, setCurrentConfidence] = useState<ConfidenceLabel>('medium');
  
  const handleAddCustomSubject = () => {
    if (customSubject.trim() && !selectedSubjects.find(s => s.subject === customSubject)) {
      selectSubject(customSubject, currentConfidence);
      setCustomSubject('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Select Your Subjects</h2>
        <p className="text-gray-600 text-sm mb-4">
          Choose the subjects you're studying. We'll create a balanced study schedule focusing more on areas where you need help.
        </p>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-md font-medium">Common Subjects</h3>
        <div className="flex flex-wrap gap-2">
          {COMMON_SUBJECTS.map((subject) => {
            const isSelected = selectedSubjects.some(s => s.subject === subject);
            return (
              <Button
                key={subject}
                variant={isSelected ? "secondary" : "outline"}
                size="sm"
                className={isSelected ? "bg-purple-100 text-purple-800 border-purple-200" : ""}
                onClick={() => {
                  if (!isSelected) {
                    selectSubject(subject, currentConfidence);
                  } else {
                    removeSubject(subject);
                  }
                }}
              >
                {subject}
                {isSelected && <X className="ml-1 h-3 w-3" />}
              </Button>
            );
          })}
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-md font-medium">Add Custom Subject</h3>
        <div className="flex gap-2">
          <Input
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            placeholder="Enter subject name"
            className="flex-1"
          />
          <Button
            onClick={handleAddCustomSubject}
            variant="outline"
            disabled={!customSubject.trim()}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>
      
      {selectedSubjects.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-md font-medium">Set Your Confidence Level</h3>
          <p className="text-sm text-gray-500">
            For each subject, select how confident you feel. We'll focus more time on subjects where you need more support.
          </p>
          
          <SubjectConfidenceSelector />
          
          <div className="pt-4">
            <Button
              onClick={() => updateOnboardingStep('availability')}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={selectedSubjects.length === 0}
            >
              Continue to Schedule <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {selectedSubjects.length === 0 && (
        <div className="bg-amber-50 p-4 rounded-md text-amber-800 text-sm">
          Please select at least one subject to continue.
        </div>
      )}
    </div>
  );
};
