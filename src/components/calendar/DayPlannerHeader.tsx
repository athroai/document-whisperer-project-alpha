
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { X, Trash2, Loader2 } from 'lucide-react';
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
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleClearDay = async () => {
    try {
      setIsClearing(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        toast({
          title: "Error",
          description: "You must be logged in to clear study sessions",
          variant: "destructive"
        });
        setIsClearing(false);
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
      let preservedCount = 0;
      
      if (eventIds.length > 0) {
        // Check for events linked to completed study sessions
        const { data: completedSessions, error: sessionsError } = await supabase
          .from('study_sessions')
          .select('id')
          .eq('student_id', session.user.id)
          .eq('status', 'completed')
          .gte('start_time', dayStart)
          .lte('end_time', dayEnd);
          
        if (sessionsError) {
          console.warn('Error checking for completed sessions:', sessionsError);
        } else {
          const completedSessionIds = completedSessions?.map(session => session.id) || [];
          
          if (completedSessionIds.length > 0) {
            // Find calendar events linked to completed study sessions
            const { data: linkedEvents } = await supabase
              .from('calendar_events')
              .select('id')
              .in('source_session_id', completedSessionIds);
              
            const excludeEventIds = linkedEvents?.map(event => event.id) || [];
            preservedCount = excludeEventIds.length;
            
            // Filter out events to preserve
            const eventIdsToDelete = eventIds.filter(id => !excludeEventIds.includes(id));
            
            if (eventIdsToDelete.length > 0) {
              // Delete study plan sessions that reference these events
              await supabase
                .from('study_plan_sessions')
                .delete()
                .in('calendar_event_id', eventIdsToDelete);
                
              // Delete the calendar events
              const { data, error } = await supabase
                .from('calendar_events')
                .delete()
                .in('id', eventIdsToDelete);
                
              if (error) throw error;
              
              const deletedCount = data?.length || 0;
              
              let description = `${deletedCount} study sessions for ${format(selectedDate, 'MMMM d, yyyy')} have been removed`;
              
              if (preservedCount > 0) {
                description += `. ${preservedCount} sessions linked to completed study activities were preserved.`;
              }
              
              toast({ title: "Day Cleared", description });
            } else {
              toast({ 
                title: "No Sessions Removed", 
                description: "All sessions for this day are linked to completed study activities and were preserved."
              });
            }
          } else {
            // No completed sessions, delete everything
            await supabase
              .from('study_plan_sessions')
              .delete()
              .in('calendar_event_id', eventIds);
              
            const { error } = await supabase
              .from('calendar_events')
              .delete()
              .in('id', eventIds);
              
            if (error) throw error;
            
            toast({
              title: "Day Cleared",
              description: `All study sessions for ${format(selectedDate, 'MMMM d, yyyy')} have been removed`
            });
          }
        }
      } else {
        toast({
          title: "No Sessions Found",
          description: `No study sessions found for ${format(selectedDate, 'MMMM d, yyyy')}`
        });
      }

      setShowConfirmation(false);
      onClose();
    } catch (error) {
      console.error('Error clearing day:', error);
      toast({
        title: "Error",
        description: "Failed to clear study sessions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold">
          {format(selectedDate, 'MMMM d, yyyy')}
        </h2>
        <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowConfirmation(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear Day
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all sessions for this day?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete study sessions scheduled for {format(selectedDate, 'MMMM d, yyyy')}.
                Sessions linked to completed study activities will be preserved.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowConfirmation(false)}>Cancel</AlertDialogCancel>
              <Button 
                variant="destructive"
                onClick={handleClearDay}
                disabled={isClearing}
              >
                {isClearing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  "Yes, clear this day"
                )}
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
