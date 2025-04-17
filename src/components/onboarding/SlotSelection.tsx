
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Clock, Calendar, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOT_OPTIONS = [
  { name: '1 x 2 hours', count: 1, duration: 120, icon: Clock, color: 'bg-purple-600' },
  { name: '2 x 1 hour', count: 2, duration: 60, icon: Clock, color: 'bg-indigo-600' },
  { name: '4 x 30 min', count: 4, duration: 30, icon: Clock, color: 'bg-blue-600' },
  { name: '6 x 20 min', count: 6, duration: 20, icon: Clock, color: 'bg-cyan-600' }
];

interface DayPreference {
  dayOfWeek: number;
  slotOption: number | null;
  preferredStartHour?: number;
}

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
      slotOption: null
    }));
    setDayPreferences(initialPreferences);
  }, []);

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

  const getSelectedOption = (dayOfWeek: number) => {
    return dayPreferences.find(day => day.dayOfWeek === dayOfWeek)?.slotOption;
  };

  const isDaySelected = (dayIndex: number) => {
    return selectedDays.includes(dayIndex);
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
      setError("Authentication required. Please log in again.");
      toast({
        title: "Authentication Required",
        description: "You need to be signed in to save your preferences.",
        variant: "destructive"
      });
      return false;
    }

    setSaving(true);

    try {
      console.log("Saving preferences for user:", state.user.id);
      console.log("Selected days:", selectedDays);
      
      // Delete any existing preferences
      const { error: deleteError } = await supabase
        .from('preferred_study_slots')
        .delete()
        .eq('user_id', state.user.id);
        
      if (deleteError) {
        console.error("Error deleting existing preferences:", deleteError);
        throw deleteError;
      }

      // Save selected days and their preferences
      const preferencesToSave = selectedDays.map(dayOfWeek => {
        const preference = dayPreferences.find(pref => pref.dayOfWeek === dayOfWeek);
        const optionIndex = preference?.slotOption ?? 0;
        const slotOption = SLOT_OPTIONS[optionIndex];

        return {
          user_id: state.user.id,
          day_of_week: dayOfWeek,
          slot_duration_minutes: slotOption.duration,
          slot_count: slotOption.count,
          preferred_start_hour: preference?.preferredStartHour || 9 // Default to 9 AM
        };
      });

      console.log("Preferences to save:", preferencesToSave);

      if (preferencesToSave.length > 0) {
        const { data, error: insertError } = await supabase
          .from('preferred_study_slots')
          .insert(preferencesToSave);

        if (insertError) {
          console.error("Error inserting new preferences:", insertError);
          throw insertError;
        }

        console.log("Preferences saved successfully:", data);
        
        // Update onboarding progress using upsert with onConflict correctly
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
          throw upsertError;
        }
          
        toast({
          title: "Preferences Saved",
          description: "Your study time preferences have been saved successfully."
        });
        
        return true;
      }
      
      return false;
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

  // Visual representation of time slots
  const renderTimeSlots = (dayOfWeek: number) => {
    const selectedOptionIndex = getSelectedOption(dayOfWeek);
    if (selectedOptionIndex === null) return null;

    const option = SLOT_OPTIONS[selectedOptionIndex];
    const slots = [];

    for (let i = 0; i < option.count; i++) {
      slots.push(
        <div 
          key={i}
          className={`${option.color} rounded-md p-3 text-white shadow-sm`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{option.duration} min study slot</span>
            <option.icon className="h-4 w-4" />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2 mt-4">
        <h4 className="text-sm font-medium text-gray-500">Preview:</h4>
        <div className="space-y-2">
          {slots}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Total: {option.count * option.duration} minutes
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div>
        <h3 className="text-lg font-medium mb-2">Select Your Study Days</h3>
        <p className="text-sm text-gray-500 mb-4">
          Choose which days of the week you plan to study
        </p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {DAYS_OF_WEEK.map((day, index) => (
            <Button 
              key={day}
              variant={isDaySelected(index + 1) ? "default" : "outline"}
              className={isDaySelected(index + 1) ? "bg-purple-600 hover:bg-purple-700" : ""}
              onClick={() => toggleDaySelection(index + 1)}
            >
              {isDaySelected(index + 1) && <Check className="mr-1 h-4 w-4" />}
              {day.substring(0, 3)}
            </Button>
          ))}
        </div>
      </div>

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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SLOT_OPTIONS.map((option, index) => (
                    <Card 
                      key={index} 
                      className={`p-4 cursor-pointer ${
                        getSelectedOption(dayIndex) === index ? 'ring-2 ring-purple-500 border-purple-300' : ''
                      }`}
                      onClick={() => selectSlotOption(dayIndex, index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`${option.color} h-8 w-8 rounded-full flex items-center justify-center mr-3`}>
                            <option.icon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h5 className="font-medium">{option.name}</h5>
                            <p className="text-sm text-gray-500">
                              {option.count} session{option.count > 1 ? 's' : ''}, 
                              {option.count * option.duration} minutes total
                            </p>
                          </div>
                        </div>
                        {getSelectedOption(dayIndex) === index && (
                          <Check className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                {renderTimeSlots(dayIndex)}
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
