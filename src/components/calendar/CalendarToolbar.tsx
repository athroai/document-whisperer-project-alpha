
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader, RefreshCw } from 'lucide-react';
import BlockTimeButton from './BlockTimeButton';

interface CalendarToolbarProps {
  isLoading: boolean;
  onRefresh: () => void;
}

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({ isLoading, onRefresh }) => (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-bold text-gray-800">Study Calendar</h1>
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-2" />
        )}
        Refresh
      </Button>
      <BlockTimeButton />
    </div>
  </div>
);

export default CalendarToolbar;
