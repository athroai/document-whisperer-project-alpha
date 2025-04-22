import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarPlus, RefreshCw, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface CalendarToolbarProps {
  isLoading: boolean;
  onRefresh: () => void;
  onRestartOnboarding?: () => void;
}

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  isLoading,
  onRefresh,
  onRestartOnboarding
}) => {
  const { toast } = useToast();

  const handleClearCalendar = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        toast({
          title: "Error",
          description: "You must be logged in to clear your calendar",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('user_id', session.user.id);

      if (error) throw error;

      toast({
        title: "Calendar Cleared",
        description: "All study sessions have been removed from your calendar"
      });

      onRefresh();
    } catch (error) {
      console.error('Error clearing calendar:', error);
      toast({
        title: "Error",
        description: "Failed to clear calendar. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh Calendar
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear Calendar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete all study sessions from your calendar. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    Yes, clear everything
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Final confirmation</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you really sure you want to delete all your study sessions? 
                      You will need to rebuild your study schedule from scratch.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, keep my schedule</AlertDialogCancel>
                    <Button 
                      variant="destructive"
                      onClick={handleClearCalendar}
                    >
                      Yes, I'm sure
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {onRestartOnboarding && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRestartOnboarding}
          disabled={isLoading}
        >
          <CalendarPlus className="h-4 w-4 mr-1" />
          Restart Onboarding
        </Button>
      )}
    </div>
  );
};

export default CalendarToolbar;
