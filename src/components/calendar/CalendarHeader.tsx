
import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarPlus, RefreshCw } from 'lucide-react';

interface CalendarHeaderProps {
  onRefresh: () => void;
  onAddSession: () => void;
  showRefreshButton?: boolean;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ 
  onRefresh, 
  onAddSession,
  showRefreshButton = true 
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold text-gray-800">Study Calendar</h2>
      <div className="flex space-x-2">
        {showRefreshButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="text-gray-600 hover:text-gray-900"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        )}
        <Button
          variant="default"
          size="sm"
          onClick={onAddSession}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <CalendarPlus className="h-4 w-4 mr-1" />
          New Session
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
