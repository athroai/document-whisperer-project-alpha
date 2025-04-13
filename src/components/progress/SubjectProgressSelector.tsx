
import React from 'react';
import { SubjectProgress } from '@/types/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SubjectProgressSelectorProps {
  subjects: SubjectProgress[];
  activeSubject: string;
  onSubjectChange: (subject: string) => void;
}

const SubjectProgressSelector: React.FC<SubjectProgressSelectorProps> = ({ 
  subjects, 
  activeSubject,
  onSubjectChange
}) => {
  return (
    <Tabs 
      defaultValue={activeSubject} 
      value={activeSubject}
      onValueChange={onSubjectChange}
      className="w-full"
    >
      <TabsList className="mb-4 w-full justify-start overflow-x-auto">
        {subjects.map((subject) => (
          <TabsTrigger key={subject.subject} value={subject.subject}>
            {subject.subject}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default SubjectProgressSelector;
