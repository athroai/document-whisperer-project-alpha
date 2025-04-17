
import React, { useState, useEffect, useCallback } from 'react';
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
  const { updateOnboardingStep, studySlots: existingSlots, setStudySlots } = useOnboarding();
  
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [dayPreferences, setDayPreferences] = useState<DayPreference[]>([]);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Initialize day preferences once
  useEffect(() => {
    const initialPreferences = DAYS_OF_WEEK.map((_, index) => ({
      dayOfWeek: index + 1,
      slotOption: null,
      preferredStartHour: 9
    }));
    setDayPreferences(initialPreferences);
  }, []);

  // Set up user ID and fetch existing slots only once during component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const authenticatedUserId = data?.user?.id;
        
        if (!authenticatedUserId) {
          console.log("No authenticated user found");
          setError("Authentication required. Please sign in again.");
          return;
        }
        
        setUserId(authenticatedUserId);
        console.log("Auth check successful, user ID:", authenticatedUserId);
        
        // Only fetch slots if they aren't already available in context
        if (!existingSlots || existingSlots.length === 0) {
          // Fetch existing study slots
          console.log("Fetching study slots for user:", authenticatedUserId);
          const { data: slots, error: slotsError } = await supabase
            .from('preferred_study_slots')
            .select('*')
            .eq('user_id', authenticatedUserId);
            
          if (slotsError) {
            console.error("Error fetching study slots:", slotsError);
            return;
          }
          
          if (slots && slots.length > 0) {
            console.log("Found existing study slots:", slots);
            if (setStudySlots) {
              setStudySlots(slots);
            }
            
            // Update selected days based on existing slots
            const days = slots.map(slot => slot.day_of_week);
            setSelectedDays(days);
            
            // Update day preferences based on existing slots
            const updatedPreferences = [...dayPreferences];
            slots.forEach(slot => {
              const dayIndex = slot.day_of_week - 1;
              if (dayIndex >= 0 && dayIndex < updatedPreferences.length) {
                const slotOptionIndex = SLOT_OPTIONS.findIndex(
                  option => option.count === slot.slot_count && option.duration === slot.slot_duration_minutes
                );
                
                if (slotOptionIndex !== -1) {
                  updatedPreferences[dayIndex] = {
                    ...updatedPreferences[dayIndex],
                    slotOption: slotOptionIndex,
                    preferredStartHour: slot.preferred_start_hour || 9
                  };
                }
              }
            });
            
            setDayPreferences(updatedPreferences);
          } else {
            console.log("No existing study slots found for user:", authenticatedUserId);
          }
        } else if (existingSlots.length > 0) {
          // Use slots from context instead of fetching
          console.log("Using study slots from context:", existingSlots);
          
          // Update selected days based on existing slots
          const days = existingSlots.map(slot => slot.day_of_week);
          setSelectedDays(days);
          
          // Update day preferences based on existing slots
          const updatedPreferences = [...dayPreferences];
          existingSlots.forEach(slot => {
            const dayIndex = slot.day_of_week - 1;
            if (dayIndex >= 0 && dayIndex < updatedPreferences.length) {
              const slotOptionIndex = SLOT_OPTIONS.findIndex(
                option => option.count === slot.slot_count && option.duration === slot.slot_duration_minutes
              );
              
              if (slotOptionIndex !== -1) {
                updatedPreferences[dayIndex] = {
                  ...updatedPreferences[dayIndex],
                  slotOption: slotOptionIndex,
                  preferredStartHour: slot.preferred_start_hour || 9
                };
              }
            }
          });
          
          setDayPreferences(updatedPreferences);
          
          // If we have selected days from existing slots, set the active day to the first one
          if (days.length > 0) {
            setActiveDay(days[0]);
          }
        }
        
        setIsInitialized(true);
      } catch (err: any) {
        console.error("Auth check error:", err.message);
        setError("Failed to verify authentication status");
      }
    };
    
    checkAuthStatus();
  }, [existingSlots, setStudySlots]);

  const toggleDaySelection = useCallback((dayIndex: number) => {
    setSelectedDays(prev => {
      const newSelectedDays = prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex];
      
      if (!prev.includes(dayIndex)) {
        // If we're adding a day, automatically set the first slot option
        setDayPreferences(prevPrefs => 
          prevPrefs.map(day => 
            day.dayOfWeek === dayIndex 
              ? { ...day, slotOption: 0 } // Set to first slot option by default
              : day
          )
        );
      }
      
      // If we have days selected, make sure the active day is one of them
      if (newSelectedDays.length > 0) {
        if (!newSelectedDays.includes(activeDay)) {
          setActiveDay(newSelectedDays[0]);
        }
      }
      
      return newSelectedDays;
    });
    
    setActiveDay(dayIndex);
  }, [activeDay]);

  const selectSlotOption = useCallback((dayOfWeek: number, optionIndex: number) => {
    setDayPreferences(prev => 
      prev.map(day => 
        day.dayOfWeek === dayOfWeek 
          ? { ...day, slotOption: day.slotOption === optionIndex ? null : optionIndex }
          : day
      )
    );
  }, []);

  const updatePreferredStartHour = useCallback((dayOfWeek: number, hour: number) => {
    setDayPreferences(prev => 
      prev.map(day => 
        day.dayOfWeek === dayOfWeek 
          ? { ...day, preferredStartHour: hour }
          : day
      )
    );
  }, []);

  const getSelectedOption = useCallback((dayOfWeek: number) => {
    const preference = dayPreferences.find(day => day.dayOfWeek === dayOfWeek);
    return preference?.slotOption;
  }, [dayPreferences]);

  const getPreferredStartHour = useCallback((dayOfWeek: number) => {
    const preference = dayPreferences.find(day => day.dayOfWeek === dayOfWeek);
    return preference?.preferredStartHour || 9;
  }, [dayPreferences]);

  const hasValidSelections = useCallback(() => {
    if (selectedDays.length === 0) return false;
    
    // Check that at least one selected day has a slot option
    return selectedDays.some(day => 
      dayPreferences.find(pref => pref.dayOfWeek === day)?.slotOption !== null
    );
  }, [selectedDays, dayPreferences]);

  const savePreferences = async () => {
    setError(null);
    
    // Check if any days are selected
    if (selectedDays.length === 0) {
      setError("Please select at least one day to study.");
      toast({
        description: "Please select at least one day to study.",
        variant: "destructive"
      });
      return false;
    }
    
    // Check if selected days have slot options
    const hasSlotOptions = selectedDays.some(day => 
      dayPreferences.find(pref => pref.dayOfWeek === day)?.slotOption !== null
    );
    
    if (!hasSlotOptions) {
      setError("Please select a study session format for at least one day.");
      toast({
        description: "Please select a study session format for at least one day.",
        variant: "destructive"
      });
      return false;
    }
    
    // Validate that we have a valid user ID
    const currentUserId = state.user?.id || userId;
    
    if (!currentUserId) {
      // Try to get current user directly from Supabase as a final attempt
      const { data } = await supabase.auth.getUser();
      const authUserId = data?.user?.id;
      
      if (!authUserId) {
        const errorMsg = "Authentication required. Please log in again.";
        setError(errorMsg);
        toast({
          description: "You need to be signed in to save your preferences.",
          variant: "destructive"
        });
        console.error("No valid user ID available when trying to save preferences");
        return false;
      }
      
      setUserId(authUserId);
    }

    setSaving(true);

    try {
      const userIdToUse = currentUserId || state.user?.id || userId;
      console.log("Starting to save preferences for user:", userIdToUse);

      // Delete existing preferences
      const { error: deleteError } = await supabase
        .from('preferred_study_slots')
        .delete()
        .eq('user_id', userIdToUse);
      
      if (deleteError) {
        console.error("Error deleting existing preferences:", deleteError);
        // Continue anyway as we'll try to upsert new preferences
      } else {
        console.log("Successfully deleted existing preferences");
      }

      // Create preferences to save
      const preferencesToSave = selectedDays
        .filter(dayOfWeek => {
          // Only include days with selected slot options
          const preference = dayPreferences.find(pref => pref.dayOfWeek === dayOfWeek);
          return preference?.slotOption !== null && preference?.slotOption !== undefined;
        })
        .map(dayOfWeek => {
          const preference = dayPreferences.find(pref => pref.dayOfWeek === dayOfWeek);
          const optionIndex = preference?.slotOption ?? 0;
          const slotOption = SLOT_OPTIONS[optionIndex];
          
          const preferenceData = {
            user_id: userIdToUse,
            day_of_week: dayOfWeek,
            slot_duration_minutes: slotOption.duration,
            slot_count: slotOption.count,
            preferred_start_hour: preference?.preferredStartHour || 9,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log("Preparing study slot preference:", preferenceData);
          return preferenceData;
        });

      if (preferencesToSave.length === 0) {
        throw new Error("No valid study preferences to save. Please select at least one day and slot option.");
      }

      console.log("Full payload for preferred_study_slots:", preferencesToSave);

      // Insert new preferences
      const { data, error: insertError } = await supabase
        .from('preferred_study_slots')
        .insert(preferencesToSave)
        .select();

      if (insertError) {
        console.error("Error inserting preferences:", insertError);
        throw new Error(`Failed to save preferences: ${insertError.message}`);
      }

      console.log("Successfully saved preferences:", data);
      
      if (setStudySlots) {
        setStudySlots(data);
      }

      // Update onboarding progress
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .upsert({
          student_id: userIdToUse,
          current_step: 'diagnosticQuiz',
          has_completed_availability: true
        }, {
          onConflict: 'student_id'
        });
        
      if (progressError) {
        console.warn("Unable to update onboarding progress:", progressError);
        // Continue anyway as this is not critical
      }
        
      toast({
        description: "Your study time preferences have been saved successfully."
      });
      
      return true;
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      setError(error.message || "Failed to save preferences");
      toast({
        description: error.message || "Failed to save your preferences. Please try again.",
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
        updateOnboardingStep('diagnosticQuiz');
      }
    } catch (error) {
      console.error("Error in handleContinue:", error);
      setError("Failed to proceed to next step. Please try again.");
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-pulse">
          <p className="text-gray-500">Loading your study preferences...</p>
        </div>
      </div>
    );
  }

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
