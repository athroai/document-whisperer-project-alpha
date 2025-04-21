
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Calendar, Check } from 'lucide-react';

interface CalendarToolbarProps {
  isLoading: boolean;
  onRefresh: () => void;
  onRestartOnboarding: () => void;
}

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({ 
  isLoading, 
  onRefresh,
  onRestartOnboarding
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Study Calendar</h1>
        <p className="text-muted-foreground">
          View and manage your upcoming study sessions
        </p>
      </div>
      
      <div className="flex space-x-2 mt-4 sm:mt-0">
        <Button 
          variant="outline" 
          onClick={onRestartOnboarding}
          className="text-sm"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Restart Onboarding
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onRefresh}
          disabled={isLoading}
          className="text-sm"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
    </div>
  );
};

export default CalendarToolbar;
