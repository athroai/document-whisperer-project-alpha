
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Clock, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DaySelector } from './DaySelector';
import { SlotOptionSelector } from './SlotOptionSelector';
import { TimeSlotPreview } from './TimeSlotPreview';
import { DayPreference, SlotOption } from '@/types/study';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOT_OPTIONS: SlotOption[] = [
  { name: '1 x 2 hours', count: 1, duration: 120, icon: Clock, color: 'bg-purple-600' },
  { name: '2 x 1 hour', count: 2, duration: 60, icon: Clock, color: 'bg-indigo-600' },
  { name: '4 x 30 min', count: 4, duration: 30, icon: Clock, color: 'bg-blue-600' },
  { name: '6 x 20 min', count: 6, duration: 20, icon: Clock, color: 'bg-cyan-600' }
];

// Create time options from 6 AM to 10 PM
const TIME_OPTIONS = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 6;
  return {
    value: hour,
    label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`
  };
});

export const SlotSelection: React.FC = () => {
  const { toast } = useToast();
  const { state } = useAuth();
  const { updateOnboardingStep } = useOnboarding();
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [dayPreferences, setDayPreferences] = useState<DayPreference[]>([]);
  const [activeDay, setActiveDay] = useState<number>(1); // Monday by default
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize dayPreferences with all days of week
  useEffect(() => {
    const initialPreferences = DAYS_OF_WEEK.map((_, index) => ({
      dayOfWeek: index + 1,
      slotOption: null,
      preferredStartHour: 9 // Default to 9 AM
    }));
    setDayPreferences(initialPreferences);
  }, []);

  // Check if the user is authenticated when component mounts
  useEffect(() => {
    if (!state.user) {
      console.log("Warning: No authenticated user detected in SlotSelection");
      setError("Please ensure you're logged in to save preferences");
    } else {
      console.log("User authenticated in SlotSelection:", state.user.id);
    }
  }, [state.user]);

  const toggleDaySelection = (dayIndex: number) => {
    setSelectedDays(prev => {
      if (prev.includes(dayIndex)) {
        return prev.filter(d => d !== dayIndex);
      } else {
        return [...prev, dayIndex];
      }
    });

    // Automatically switch to the selected day's tab
    setActiveDay(dayIndex);
  };

  const selectSlotOption = (dayOfWeek: number, optionIndex: number) => {
    setDayPreferences(prev => 
      prev.map(day => 
        day.dayOfWeek === dayOfWeek 
          ? { ...day, slotOption: day.slotOption === optionIndex ? null : optionIndex }
          : day
      )
    );
  };

  const updatePreferredStartHour = (dayOfWeek: number, hour: number) => {
    setDayPreferences(prev => 
      prev.map(day => 
        day.dayOfWeek === dayOfWeek 
          ? { ...day, preferredStartHour: hour }
          : day
      )
    );
  };

  const getSelectedOption = (dayOfWeek: number) => {
    return dayPreferences.find(day => day.dayOfWeek === dayOfWeek)?.slotOption;
  };

  const getPreferredStartHour = (dayOfWeek: number) => {
    return dayPreferences.find(day => day.dayOfWeek === dayOfWeek)?.preferredStartHour || 9;
  };

  const hasValidSelections = () => {
    return selectedDays.length > 0 && 
      selectedDays.every(day => 
        dayPreferences.find(pref => pref.dayOfWeek === day)?.slotOption !== null
      );
  };

  const savePreferences = async () => {
    // Reset error state
    setError(null);
    
    if (!state.user?.id) {
      const errorMsg = "Authentication required. Please log in again.";
      setError(errorMsg);
      toast({
        title: "Authentication Required",
        description: "You need to be signed in to save your preferences.",
        variant: "destructive"
      });
      console.error("No authenticated user found when trying to save preferences");
      return false;
    }

    setSaving(true);

    try {
      console.log("Saving preferences for user:", state.user.id);
      console.log("Selected days:", selectedDays);
      
      try {
        // Get existing preferences first
        const { data: existingPreferences } = await supabase
          .from('preferred_study_slots')
          .select()
          .eq('user_id', state.user.id);
          
        console.log("Existing preferences:", existingPreferences);
        
        // Delete any existing preferences if they exist
        if (existingPreferences && existingPreferences.length > 0) {
          const { error: deleteError } = await supabase
            .from('preferred_study_slots')
            .delete()
            .eq('user_id', state.user.id);
            
          if (deleteError) {
            console.error("Error deleting existing preferences:", deleteError);
          } else {
            console.log("Successfully deleted existing preferences");
          }
        }
      } catch (deleteErr) {
        console.error("Exception during delete operation:", deleteErr);
        // Continue with the insert operation even if delete failed
      }

      // Save selected days and their preferences
      const preferencesToSave = selectedDays.map(dayOfWeek => {
        const preference = dayPreferences.find(pref => pref.dayOfWeek === dayOfWeek);
        const optionIndex = preference?.slotOption ?? 0;
        const slotOption = SLOT_OPTIONS[optionIndex];
        const preferredStartHour = preference?.preferredStartHour || 9;

        return {
          user_id: state.user.id,
          day_of_week: dayOfWeek,
          slot_duration_minutes: slotOption.duration,
          slot_count: slotOption.count,
          preferred_start_hour: preferredStartHour
        };
      });

      console.log("Preferences to save:", preferencesToSave);

      if (preferencesToSave.length > 0) {
        const { data, error: insertError } = await supabase
          .from('preferred_study_slots')
          .insert(preferencesToSave)
          .select();

        if (insertError) {
          console.error("Error inserting new preferences:", insertError);
          throw new Error(`Failed to save preferences: ${insertError.message}`);
        }

        console.log("Preferences saved successfully:", data);
        
        // Update onboarding progress
        const { error: upsertError } = await supabase
          .from('onboarding_progress')
          .upsert({
            student_id: state.user.id,
            current_step: 'diagnosticQuiz',
            has_completed_availability: true
          }, {
            onConflict: 'student_id'
          });
          
        if (upsertError) {
          console.error("Error updating onboarding progress:", upsertError);
          toast({
            title: "Note",
            description: "Preferences saved but progress update failed. You can still continue."
          });
        } else {
          toast({
            title: "Preferences Saved",
            description: "Your study time preferences have been saved successfully."
          });
        }
        
        return true;
      } else {
        toast({
          title: "No Preferences",
          description: "Please select at least one day and format before continuing."
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      setError(error.message || "Failed to save preferences");
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = async () => {
    try {
      const saved = await savePreferences();
      if (saved) {
        updateOnboardingStep && updateOnboardingStep('diagnosticQuiz');
      }
    } catch (error) {
      console.error("Error in handleContinue:", error);
      setError("Failed to proceed to next step. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <DaySelector 
        selectedDays={selectedDays} 
        toggleDaySelection={toggleDaySelection} 
      />

      {selectedDays.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Choose Study Session Format</h3>
          <p className="text-sm text-gray-500 mb-4">
            Select your preferred study session breakdown for each day
          </p>

          <Tabs 
            value={activeDay.toString()} 
            onValueChange={(value) => setActiveDay(Number(value))}
            className="w-full"
          >
            <TabsList className="mb-4">
              {selectedDays.map((dayIndex) => (
                <TabsTrigger key={dayIndex} value={dayIndex.toString()}>
                  {DAYS_OF_WEEK[dayIndex - 1].substring(0, 3)}
                </TabsTrigger>
              ))}
            </TabsList>

            {selectedDays.map((dayIndex) => (
              <TabsContent key={dayIndex} value={dayIndex.toString()}>
                <h4 className="text-md font-medium mb-3">{DAYS_OF_WEEK[dayIndex - 1]} Study Plan</h4>
                
                <div className="mb-4">
                  <Label htmlFor={`startTime-${dayIndex}`}>Preferred Start Time</Label>
                  <Select
                    value={getPreferredStartHour(dayIndex).toString()}
                    onValueChange={(value) => updatePreferredStartHour(dayIndex, parseInt(value))}
                  >
                    <SelectTrigger id={`startTime-${dayIndex}`} className="w-full md:w-[200px]">
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <SlotOptionSelector 
                  slotOptions={SLOT_OPTIONS}
                  selectedOption={getSelectedOption(dayIndex)}
                  onSelectOption={(optionIndex) => selectSlotOption(dayIndex, optionIndex)}
                />

                <TimeSlotPreview 
                  selectedOption={getSelectedOption(dayIndex) !== null ? SLOT_OPTIONS[getSelectedOption(dayIndex)!] : null}
                  preferredStartHour={getPreferredStartHour(dayIndex)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}

      {selectedDays.length === 0 && (
        <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h4 className="text-lg font-medium mb-1">No Study Days Selected</h4>
          <p className="text-gray-500">
            Please select at least one day of the week to study
          </p>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <Button 
          onClick={handleContinue} 
          disabled={!hasValidSelections() || saving}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {saving ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
};
