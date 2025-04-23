
import React, { useState } from 'react';
import { DaySelector } from './DaySelector';
import { DaySessionScheduler } from './DaySessionScheduler';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useStudyScheduleCore } from '@/hooks/schedule/useStudyScheduleCore';
import { Loader2, ArrowRight } from 'lucide-react';

export const StudyScheduleSetup: React.FC = () => {
  const {
    selectedDays,
    dayPreferences,
    isSubmitting,
    error,
    handleDayToggle,
    handleSessionTimeChange,
    handleSessionDurationChange,
    handleAddSession,
    handleRemoveSession,
    handleContinue
  } = useStudyScheduleCore();

  const { toast } = useToast();
  const [schedulerVisible, setSchedulerVisible] = useState(false);

  const onDayToggle = (day: number) => {
    handleDayToggle(day);
  };

  const goToScheduler = () => {
    if (selectedDays.length === 0) {
      toast({
        title: "No days selected",
        description: "Please select at least one day for your study schedule.",
        variant: "destructive"
      });
      return;
    }
    setSchedulerVisible(true);
  };

  return (
    <div className="space-y-6">
      <div className={`transition-all ${schedulerVisible ? 'opacity-50' : 'opacity-100'}`}>
        <DaySelector 
          selectedDays={selectedDays}
          toggleDaySelection={onDayToggle}
        />
        
        {!schedulerVisible && (
          <div className="mt-6 flex justify-end">
            <Button onClick={goToScheduler}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {schedulerVisible && (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-300">
          <DaySessionScheduler 
            selectedDays={selectedDays}
            dayPreferences={dayPreferences}
            handleSessionTimeChange={handleSessionTimeChange}
            handleSessionDurationChange={handleSessionDurationChange}
            handleAddSession={handleAddSession}
            handleRemoveSession={handleRemoveSession}
          />
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}
          
          <div className="mt-6 flex justify-between">
            <Button 
              variant="outline"
              onClick={() => setSchedulerVisible(false)}
            >
              Back to Day Selection
            </Button>
            
            <Button 
              onClick={handleContinue}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save Schedule <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
