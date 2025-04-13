
import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Class } from '@/types/teacher';
import { useAuth } from '@/contexts/AuthContext';

interface InquiryClassFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const InquiryClassFilter: React.FC<InquiryClassFilterProps> = ({ value, onChange }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const { state } = useAuth();
  const { user } = state;

  useEffect(() => {
    // In a real app, we'd fetch the teacher's classes here
    // For now, we'll just use mock data
    setClasses([
      { id: 'class-1a', name: '1A - Mathematics', teacher_id: 'teacher1', school_id: 'school1', subject: 'Mathematics', student_ids: [], yearGroup: 'Year 1' },
      { id: 'class-2b', name: '2B - Science', teacher_id: 'teacher1', school_id: 'school1', subject: 'Science', student_ids: [], yearGroup: 'Year 2' },
      { id: 'class-3c', name: '3C - English', teacher_id: 'teacher1', school_id: 'school1', subject: 'English', student_ids: [], yearGroup: 'Year 3' },
    ]);
  }, [user]);

  return (
    <div className="space-y-2">
      <Label htmlFor="class-filter">Class</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="class-filter">
          <SelectValue placeholder="Select class" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Classes</SelectItem>
          {classes.map((cls) => (
            <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
