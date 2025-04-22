
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useStudySchedule } from '@/hooks/useStudySchedule';

export const useWeeklyPlanning = (onSuccess: () => void) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPlanningWeek, setIsPlanningWeek] = useState(false);
  const { toast } = useToast();
  const { handleContinue: generateStudyPlan } = useStudySchedule();

  const handlePlanWeek = async () => {
    try {
      setIsPlanningWeek(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please log in to plan your week",
          variant: "destructive"
        });
        return;
      }

      await generateStudyPlan();
      
      toast({
        title: "Success",
        description: "Your week has been planned! Pull to refresh the calendar to see your new sessions.",
      });
      
      setIsDialogOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error planning week:', error);
      toast({
        title: "Error",
        description: "Failed to plan your week. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPlanningWeek(false);
    }
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    isPlanningWeek,
    handlePlanWeek
  };
};
