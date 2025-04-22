import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarPlus, RefreshCw, Trash2, Loader2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useWeeklyPlanning } from '@/hooks/useWeeklyPlanning';
import { WeeklyPlanningDialog } from './WeeklyPlanningDialog';

interface CalendarToolbarProps {
  isLoading: boolean;
  onRefresh: () => void;
}

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  isLoading,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [clearingCalendar, setClearingCalendar] = useState(false);
  const [showFirstConfirmation, setShowFirstConfirmation] = useState(false);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  
  const {
    isDialogOpen,
    setIsDialogOpen,
    isPlanningWeek,
    handlePlanWeek
  } = useWeeklyPlanning(onRefresh);

  const handleClearCalendar = async () => {
    try {
      setClearingCalendar(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        toast({
          title: "Error",
          description: "You must be logged in to clear your calendar",
          variant: "destructive"
        });
        setClearingCalendar(false);
        setShowFinalConfirmation(false);
        return;
      }

      // Call the Edge Function to handle clearing the calendar
      const { data, error } = await supabase.functions.invoke('clear-calendar', {
        body: {
          user_id: session.user.id,
          preserve_completed: true
        }
      });
      
      if (error) {
        console.error('Error calling clear-calendar function:', error);
        throw new Error(error.message || 'Failed to clear calendar');
      }
      
      const deletedCount = data?.deleted_count || 0;
      const preservedCount = data?.preserved_count || 0;
      
      let description = `${deletedCount} study sessions have been removed from your calendar.`;
      
      if (preservedCount > 0) {
        description += ` ${preservedCount} sessions linked to completed study sessions were preserved.`;
      }

      toast({
        title: "Calendar Cleared",
        description
      });

      // Close the confirmation dialogs
      setShowFirstConfirmation(false);
      setShowFinalConfirmation(false);

      // Allow the user to see the success message before refreshing
      setTimeout(() => {
        onRefresh();
        setClearingCalendar(false);
      }, 500);
    } catch (error) {
      console.error('Error clearing calendar:', error);
      toast({
        title: "Error",
        description: "Failed to clear calendar. Please try again.",
        variant: "destructive"
      });
      setClearingCalendar(false);
      setShowFirstConfirmation(false);
      setShowFinalConfirmation(false);
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading || clearingCalendar || isPlanningWeek}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1" />
          )}
          Refresh Calendar
        </Button>

        <AlertDialog open={showFirstConfirmation} onOpenChange={setShowFirstConfirmation}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={isLoading || clearingCalendar || isPlanningWeek}
            >
              {clearingCalendar ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              Clear Calendar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete study sessions from your calendar. 
                Sessions linked to completed study activities will be preserved.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowFirstConfirmation(false)}>Cancel</AlertDialogCancel>
              <AlertDialog open={showFinalConfirmation} onOpenChange={setShowFinalConfirmation}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" onClick={() => setShowFinalConfirmation(true)}>
                    Yes, clear my calendar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Final confirmation</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you really sure you want to delete your study sessions?
                      Completed study sessions will remain in your history.
                      You will need to rebuild your remaining study schedule.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowFinalConfirmation(false);
                        setShowFirstConfirmation(false);
                      }}
                    >
                      No, keep my schedule
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={handleClearCalendar}
                      disabled={clearingCalendar}
                    >
                      {clearingCalendar ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Clearing...
                        </>
                      ) : (
                        "Yes, I'm sure"
                      )}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        disabled={isLoading || clearingCalendar || isPlanningWeek}
      >
        {isPlanningWeek ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <CalendarPlus className="h-4 w-4 mr-1" />
        )}
        Plan My Week
      </Button>

      <WeeklyPlanningDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handlePlanWeek}
        isLoading={isPlanningWeek}
      />
    </div>
  );
};

export default CalendarToolbar;
