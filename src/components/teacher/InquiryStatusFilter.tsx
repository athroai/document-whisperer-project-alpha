
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface InquiryStatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const InquiryStatusFilter: React.FC<InquiryStatusFilterProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="status-filter">Status</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="status-filter">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="unread">Unread</SelectItem>
          <SelectItem value="read">Read</SelectItem>
          <SelectItem value="replied">Replied</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
