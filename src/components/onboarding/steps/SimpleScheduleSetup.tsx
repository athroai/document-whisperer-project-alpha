
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DaySelector } from '@/components/onboarding/DaySelector';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { COMMON_SUBJECTS } from '@/hooks/useSubjects';

export const SimpleScheduleSetup: React.FC = () => {
  const { updateOnboardingStep, updateStudySlots, selectedSubjects, setSelectedSubjects } = useOnboarding();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default to Mon-Fri
  const [sessionDuration, setSessionDuration] = useState<string>('medium');
  const [preferredStartHour, setPreferredStartHour] = useState<number>(16); // 4 PM default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Enhanced loading and error handling for subject data
  useEffect(() => {
    let mounted = true;
    const loadSubjects = async () => {
      setIsLoading(true);
      setSubjectError(null);

      try {
        // If we already have subjects in context, use them
        if (selectedSubjects && selectedSubjects.length > 0) {
          console.log("Using subjects from context:", selectedSubjects);
          if (mounted) {
            setSelectedSubject(selectedSubjects[0].subject);
            setIsLoading(false);
          }
          return;
        }

        // Try to load subjects from localStorage as fallback
        const storedSubjects = localStorage.getItem('athro_selected_subjects');
        if (storedSubjects) {
          try {
            const parsedSubjects = JSON.parse(storedSubjects);
            if (parsedSubjects.length > 0) {
              console.log("Using subjects from localStorage:", parsedSubjects);
              setSelectedSubjects(parsedSubjects);
              if (mounted && parsedSubjects[0] && parsedSubjects[0].subject) {
                setSelectedSubject(parsedSubjects[0].subject);
              }
            }
          } catch (error) {
            console.error("Error parsing stored subjects:", error);
          }
        }
      } catch (error) {
        console.error("Error loading subjects:", error);
        if (mounted) {
          setSubjectError("Could not load your subjects. Please try again or go back to select subjects.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadSubjects();
    
    return () => { mounted = false; };
  }, [selectedSubjects, setSelectedSubjects, retryCount]);

  // Monitor for subject data and show warning if none available
  useEffect(() => {
    if (!isLoading && selectedSubjects.length === 0 && !selectedSubject) {
      setSubjectError("No subjects found. You must select at least one subject before setting your schedule.");
    } else if (selectedSubjects.length > 0) {
      setSubjectError(null);
    }
  }, [isLoading, selectedSubjects, selectedSubject]);

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

  const getDurationMinutes = (duration: string) => {
    switch (duration) {
      case 'short': return 25;
      case 'medium': return 45;
      case 'long': return 90;
      default: return 45;
    }
  };

  const handleBack = () => {
    updateOnboardingStep('subjects');
  };

  const getTimeLabel = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const retrySubjectLoad = () => {
    setRetryCount(prev => prev + 1);
    toast({
      title: "Retrying...",
      description: "Attempting to load your subject data again",
    });
  };

  const redirectToSubjectsStep = () => {
    updateOnboardingStep('subjects');
    navigate('/onboarding?step=subjects');
  };

  const handleContinue = async () => {
    if (selectedDays.length === 0) {
      toast({
        title: "No Study Days Selected",
        description: "Please select at least one day for studying",
        variant: "destructive"
      });
      return;
    }

    if (!selectedSubject) {
      toast({
        title: "No Subject Selected",
        description: "Please select a subject for your study sessions",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save study preferences
      const durationMinutes = getDurationMinutes(sessionDuration);
      
      // Create study slots for each selected day
      for (const dayOfWeek of selectedDays) {
        await updateStudySlots({
          dayOfWeek,
          slotCount: 1,
          slotDurationMinutes: durationMinutes,
          preferredStartHour, // Use the selected start hour
          subject: selectedSubject // Ensure subject is always passed
        });
      }
      
      // Cache selected subject in localStorage
      try {
        localStorage.setItem('athro_selected_subject', selectedSubject);
      } catch (e) {
        console.warn("Could not cache selected subject:", e);
      }
      
      // Proceed to next step
      await updateOnboardingStep('createEvents');
    } catch (error) {
      console.error("Error saving study schedule:", error);
      toast({
        title: "Error",
        description: "Failed to save your study schedule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Set Your Study Schedule</h2>
        <p className="text-muted-foreground mt-2">Choose when you'd like to study</p>
      </div>
      
      {/* Subject Error with Retry and Redirect Options */}
      {subjectError && !isLoading && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription className="flex flex-col gap-3">
            <div>{subjectError}</div>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={retrySubjectLoad}>
                Retry Loading
              </Button>
              <Button size="sm" variant="default" onClick={redirectToSubjectsStep}>
                Select Subjects
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-purple-200 mb-2"></div>
            <div className="h-4 w-32 bg-purple-100 rounded"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Label className="text-base font-medium">Which days will you study?</Label>
          <DaySelector 
            selectedDays={selectedDays} 
            toggleDaySelection={handleDayToggle} 
          />
        </div>
      )}

      {!isLoading && (
        <div className="space-y-4">
          <Label className="text-base font-medium">Select a subject for these sessions</Label>
          <Select
            value={selectedSubject}
            onValueChange={setSelectedSubject}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a subject" />
            </SelectTrigger>
            <SelectContent>
              {/* First show subjects from the user's selected subjects */}
              {selectedSubjects.length > 0 ? (
                selectedSubjects.map(subj => (
                  <SelectItem key={subj.subject} value={subj.subject}>
                    {subj.subject}
                  </SelectItem>
                ))
              ) : (
                // Fall back to common subjects if no subjects are selected in onboarding
                COMMON_SUBJECTS.map(subject => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {!isLoading && (
        <>
          <div className="space-y-4">
            <Label className="text-base font-medium">What time would you like to study?</Label>
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
            <Label className="text-base font-medium">How long should each study session be?</Label>
            <RadioGroup 
              value={sessionDuration} 
              onValueChange={setSessionDuration}
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
        </>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleBack} disabled={isSubmitting || isLoading}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={selectedDays.length === 0 || !selectedSubject || isSubmitting || isLoading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};
