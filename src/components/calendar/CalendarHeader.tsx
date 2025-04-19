
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';

interface CalendarHeaderProps {
  onRefresh: () => void;
  onAddSession: () => void;
}

const CalendarHeader = ({ onRefresh, onAddSession }: CalendarHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-800">Study Calendar</h2>
      <div className="flex gap-2">
        <Button 
          onClick={onRefresh}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        <Button 
          onClick={onAddSession} 
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Session
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
