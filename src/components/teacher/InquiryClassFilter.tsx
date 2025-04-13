
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface InquiryClassFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const InquiryClassFilter: React.FC<InquiryClassFilterProps> = ({ value, onChange }) => {
  // In a real app, we would fetch classes from Firestore
  const classes = [
    { id: 'class-1a', name: 'Year 7A' },
    { id: 'class-2b', name: 'Year 8B' },
    { id: 'class-3c', name: 'Year 9C' },
  ];

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
            <SelectItem key={cls.id} value={cls.id}>
              {cls.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
