
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Calendar, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';

interface CalendarToolbarProps {
  isLoading: boolean;
  onRefresh: () => void;
  onRestartOnboarding: () => void;
  onClearCalendar: () => void;
  clearLoading?: boolean;
}

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({ 
  isLoading, 
  onRefresh,
  onRestartOnboarding,
  onClearCalendar,
  clearLoading = false,
}) => {
  // Handle the restart onboarding click with confirmation
  const handleRestartOnboarding = (e: React.MouseEvent) => {
    e.preventDefault();
    const confirmed = window.confirm(
      "Are you sure you want to restart onboarding? This will reset your study plan setup."
    );
    if (confirmed) {
      onRestartOnboarding();
    }
  };
  
  const [showClearDialog, setShowClearDialog] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Study Calendar</h1>
        <p className="text-muted-foreground">
          View and manage your upcoming study sessions
        </p>
      </div>
      <div className="flex space-x-2 mt-4 sm:mt-0">
        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="text-sm"
              disabled={clearLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {clearLoading ? 'Clearing...' : 'Clear Calendar'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear Calendar</AlertDialogTitle>
              <AlertDialogDescription>
                This will erase all your study sessions except those marked as "completed".
                Are you sure you want to do this? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel aria-label="Cancel clear">Cancel</AlertDialogCancel>
              <AlertDialogAction
                aria-label="Confirm clear"
                onClick={() => {
                  setShowClearDialog(false);
                  onClearCalendar();
                }}
                disabled={clearLoading}
              >
                Yes, clear calendar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button 
          variant="outline" 
          onClick={handleRestartOnboarding}
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
