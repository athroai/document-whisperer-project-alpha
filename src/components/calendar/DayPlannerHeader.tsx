
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { X, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
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
import { startOfDay, endOfDay } from 'date-fns';

interface DayPlannerHeaderProps {
  selectedDate: Date;
  onClose: () => void;
}

const DayPlannerHeader: React.FC<DayPlannerHeaderProps> = ({ selectedDate, onClose }) => {
  const { toast } = useToast();

  const handleClearDay = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        toast({
          title: "Error",
          description: "You must be logged in to clear study sessions",
          variant: "destructive"
        });
        return;
      }

      const dayStart = startOfDay(selectedDate).toISOString();
      const dayEnd = endOfDay(selectedDate).toISOString();

      // First, get the IDs of calendar events for this day
      const { data: eventsData, error: eventsError } = await supabase
        .from('calendar_events')
        .select('id')
        .eq('user_id', session.user.id)
        .gte('start_time', dayStart)
        .lte('end_time', dayEnd);

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        throw eventsError;
      }

      const eventIds = eventsData?.map(event => event.id) || [];
      
      if (eventIds.length > 0) {
        // Delete related study plan sessions if they exist
        try {
          const { error: studyPlanError } = await supabase
            .from('study_plan_sessions')
            .delete()
            .in('calendar_event_id', eventIds);
            
          if (studyPlanError) {
            console.warn('Error clearing study plan sessions for day:', studyPlanError);
            // Continue anyway - some sessions might not have study plan entries
          }
        } catch (spError) {
          console.warn('Failed to delete study plan sessions:', spError);
          // Continue anyway
        }
      }

      // Now delete the calendar events
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('user_id', session.user.id)
        .gte('start_time', dayStart)
        .lte('end_time', dayEnd);

      if (error) throw error;

      toast({
        title: "Day Cleared",
        description: `All study sessions for ${format(selectedDate, 'MMMM d, yyyy')} have been removed`
      });

      onClose();
    } catch (error) {
      console.error('Error clearing day:', error);
      toast({
        title: "Error",
        description: "Failed to clear study sessions. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold">
          {format(selectedDate, 'MMMM d, yyyy')}
        </h2>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear Day
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all sessions for this day?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all study sessions scheduled for {format(selectedDate, 'MMMM d, yyyy')}. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button 
                variant="destructive"
                onClick={handleClearDay}
              >
                Yes, clear this day
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
    </div>
  );
};

export default DayPlannerHeader;
