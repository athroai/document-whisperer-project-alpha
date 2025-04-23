
import React, { useState } from 'react';
import { DaySelector } from '@/components/onboarding/DaySelector';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const ScheduleSetupStep: React.FC = () => {
  const { toast } = useToast();
  const { selectedSubjects, updateOnboardingStep } = useOnboarding();
  const { subjects: userSubjects, isLoading: userSubjectsLoading } = useUserSubjects();
  const { state: authState } = useAuth();
  
  // State for scheduling
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default Mon-Fri
  const [preferredStartHour, setPreferredStartHour] = useState<number>(16); // 4 PM default
  const [sessionDuration, setSessionDuration] = useState<'short' | 'medium' | 'long'>('medium');
  const [subjectsByDay, setSubjectsByDay] = useState<{[day: number]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get available subjects from user data
  const availableSubjects = userSubjects.length > 0 
    ? userSubjects 
    : selectedSubjects.length > 0 
      ? selectedSubjects 
      : [];

  const handleDayToggle = (dayIndex: number) => {
    setSelectedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex) 
        : [...prev, dayIndex].sort((a, b) => {
            // Sort Sunday (0) at the end of the array
            if (a === 0) return 1;
            if (b === 0) return -1;
            return a - b;
          })
    );
  };

  const getDurationMinutes = (duration: 'short' | 'medium' | 'long'): number => {
    switch (duration) {
      case 'short': return 25;
      case 'medium': return 45;
      case 'long': return 90;
    }
  };

  const getTimeLabel = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const handleSubjectChange = (day: number, subject: string) => {
    setSubjectsByDay(prev => ({
      ...prev,
      [day]: subject
    }));
  };

  const getDayName = (dayIndex: number): string => {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex];
  };

  const getFirstAvailableSubject = (): string => {
    if (availableSubjects.length > 0) {
      if ('subject' in availableSubjects[0]) {
        return availableSubjects[0].subject;
      } 
      // Handle case where availableSubjects might just be strings
      return String(availableSubjects[0]);
    }
    return "";
  };

  const handleBack = () => {
    updateOnboardingStep('subjects');
  };

  const handleContinue = async () => {
    if (selectedDays.length === 0) {
      toast({
        title: "No Days Selected",
        description: "Please select at least one day for your study schedule.",
        variant: "destructive"
      });
      return;
    }

    if (availableSubjects.length === 0) {
      toast({
        title: "No Subjects Available",
        description: "Please go back and select at least one subject.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const userId = authState.user?.id;
      if (!userId) {
        throw new Error("You must be logged in to save your schedule");
      }

      // First, delete existing study slots
      await supabase
        .from('preferred_study_slots')
        .delete()
        .eq('user_id', userId);

      // Create study slots for each selected day
      const slots = [];
      const durationMinutes = getDurationMinutes(sessionDuration);

      for (const day of selectedDays) {
        // Get the subject for this day, or distribute subjects if not specifically set
        let subjectForDay = subjectsByDay[day];
        if (!subjectForDay) {
          const subjectIndex = day % availableSubjects.length;
          const subjectData = availableSubjects[subjectIndex];
          subjectForDay = typeof subjectData === 'string' ? subjectData : subjectData.subject;
        }

        slots.push({
          user_id: userId,
          day_of_week: day,
          slot_count: 1,
          slot_duration_minutes: durationMinutes,
          preferred_start_hour: preferredStartHour,
          subject: subjectForDay
        });
      }

      // Insert all slots
      await supabase
        .from('preferred_study_slots')
        .insert(slots);

      // Store in localStorage as backup
      localStorage.setItem('athro_study_slots', JSON.stringify(slots));

      // Move to next step
      updateOnboardingStep('createEvents');
      
      toast({
        title: "Schedule Saved",
        description: `Your study schedule has been created for ${selectedDays.length} days.`,
      });
    } catch (error: any) {
      console.error("Error saving schedule:", error);
      setError(error.message || "Failed to save study schedule. Please try again.");
      toast({
        title: "Error",
        description: error.message || "Failed to save study schedule",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userSubjectsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your subjects...</span>
      </div>
    );
  }

  if (availableSubjects.length === 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription className="flex flex-col gap-3">
          <div>No subjects found. You need to select subjects before creating a schedule.</div>
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="default" onClick={() => updateOnboardingStep('subjects')}>
              Go to Subject Selection
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Set Your Study Schedule</h2>
        <p className="text-muted-foreground mt-1">
          Choose when you'd like to study each week. We'll create sessions based on your availability.
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-base">Which days will you study?</Label>
        <DaySelector 
          selectedDays={selectedDays} 
          toggleDaySelection={handleDayToggle} 
        />
      </div>

      <div className="space-y-4">
        <Label className="text-base">What time would you like to study?</Label>
        <div className="space-y-4">
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{getTimeLabel(preferredStartHour)}</span>
          </div>
          
          <Slider
            value={[preferredStartHour]}
            min={8} // 8 AM
            max={20} // 8 PM
            step={1}
            onValueChange={(values) => setPreferredStartHour(values[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>8 AM</span>
            <span>2 PM</span>
            <span>8 PM</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base">How long should each study session be?</Label>
        <RadioGroup 
          value={sessionDuration} 
          onValueChange={(value) => setSessionDuration(value as 'short' | 'medium' | 'long')}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="flex items-center space-x-2 border rounded-md p-4">
            <RadioGroupItem value="short" id="short" />
            <Label htmlFor="short" className="cursor-pointer flex-1">
              <div className="font-medium">Short</div>
              <div className="text-sm text-gray-500">25 minutes</div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-4">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium" className="cursor-pointer flex-1">
              <div className="font-medium">Medium</div>
              <div className="text-sm text-gray-500">45 minutes</div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-4">
            <RadioGroupItem value="long" id="long" />
            <Label htmlFor="long" className="cursor-pointer flex-1">
              <div className="font-medium">Long</div>
              <div className="text-sm text-gray-500">90 minutes</div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {selectedDays.length > 0 && (
        <div className="space-y-4 border-t pt-4">
          <Label className="text-base">Assign subjects to specific days (optional)</Label>
          <p className="text-sm text-muted-foreground">
            You can assign specific subjects to each day, or leave them blank to have subjects distributed automatically.
          </p>
          
          <div className="space-y-3">
            {selectedDays.map(day => (
              <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <Label className="min-w-[100px] font-medium">{getDayName(day)}:</Label>
                <Select
                  value={subjectsByDay[day] || ''}
                  onValueChange={(value) => handleSubjectChange(day, value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map((subj, index) => {
                      const subjectName = typeof subj === 'string' ? subj : subj.subject;
                      return (
                        <SelectItem key={`${subjectName}-${index}`} value={subjectName}>
                          {subjectName}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <Button 
          onClick={handleContinue} 
          disabled={selectedDays.length === 0 || isSubmitting}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
