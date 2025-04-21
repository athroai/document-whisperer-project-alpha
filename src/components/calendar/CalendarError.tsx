
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarErrorProps {
  error: string;
  onRetry: () => void;
}

const CalendarError = ({ error, onRetry }: CalendarErrorProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4 bg-white rounded-lg shadow">
      <div className="text-red-500 font-medium">Error loading calendar events</div>
      <p className="text-gray-600 text-center">{error}</p>
      <Button 
        variant="outline"
        onClick={onRetry}
        className="mt-4"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry Loading
      </Button>
    </div>
  );
};

export default CalendarError;
