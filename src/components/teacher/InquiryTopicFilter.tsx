
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface InquiryTopicFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const InquiryTopicFilter: React.FC<InquiryTopicFilterProps> = ({ value, onChange }) => {
  const topics = [
    'Progress',
    'Wellbeing',
    'Homework',
    'Attendance',
    'Behavior',
    'Other'
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="topic-filter">Topic</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="topic-filter">
          <SelectValue placeholder="Select topic" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Topics</SelectItem>
          {topics.map((topic) => (
            <SelectItem key={topic} value={topic}>{topic}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
