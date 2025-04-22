
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface DayPlannerHeaderProps {
  selectedDate: Date;
  onClose: () => void;
}

const DayPlannerHeader = ({ selectedDate, onClose }: DayPlannerHeaderProps) => {
  return (
    <div className="flex items-center justify-between border-b p-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h2>
      </div>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default DayPlannerHeader;
