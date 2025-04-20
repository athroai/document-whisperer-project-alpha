
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CalendarEmptyStateProps {
  needsOnboarding: boolean;
  onRefresh: () => void;
}

const CalendarEmptyState: React.FC<CalendarEmptyStateProps> = ({
  needsOnboarding,
  onRefresh
}) => {
  const navigate = useNavigate();

  return (
    <div className="mt-6 text-center p-8 bg-white rounded-lg shadow border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">No calendar events found</h2>
      <p className="text-gray-500 mb-4">
        It looks like you don't have any study sessions scheduled yet. 
        Try refreshing or click a date on the calendar to add a new study session.
      </p>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-center">
        <Button onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Calendar
        </Button>
        {needsOnboarding && (
          <Button 
            variant="secondary" 
            onClick={() => navigate('/athro-onboarding')}
          >
            Complete Onboarding
          </Button>
        )}
      </div>
    </div>
  );
};

export default CalendarEmptyState;
