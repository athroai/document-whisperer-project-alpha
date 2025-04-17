
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const StudyPlanGenerator: React.FC = () => {
  const { state } = useAuth();
  const { toast } = useToast();
  const { selectedSubjects, availability, completeOnboarding } = useOnboarding();
  const [isGenerating, setIsGenerating] = useState(false);
  const [studyPlan, setStudyPlan] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateStudyPlan = async () => {
    // Clear previous errors
    setError(null);
    setIsGenerating(true);

    try {
      if (!state.user) {
        toast({
          title: "Authentication Required",
          description: "You need to be signed in to generate a study plan. Please refresh the page or sign in again.",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }

      console.log("Generating study plan for user:", state.user.id);
      console.log("Selected subjects:", selectedSubjects);
      console.log("Availability:", availability);

      // Check if subjects and availability are present
      if (!selectedSubjects || selectedSubjects.length === 0) {
        setError("No subjects selected. Please go back to the subjects step and select at least one subject.");
        setIsGenerating(false);
        return;
      }

      if (!availability || availability.length === 0) {
        setError("No availability set. Please go back to the availability step and set your study time.");
        setIsGenerating(false);
        return;
      }
      
      // Create session dates based on availability
      const today = new Date();
      const planItemsWithDates = selectedSubjects.map((subject, index) => {
        const availabilitySlot = availability[index % availability.length];
        
        if (!availabilitySlot) {
          throw new Error("No availability found. Please set your availability first.");
        }
        
        // Convert time strings to hours and minutes
        const [startHours, startMinutes] = availabilitySlot.startTime.split(':').map(Number);
        const [endHours, endMinutes] = availabilitySlot.endTime.split(':').map(Number);
        
        // Calculate the next occurrence of this day of week
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() + (availabilitySlot.dayOfWeek - startDate.getDay() + 7) % 7);
        startDate.setHours(startHours, startMinutes, 0, 0);
        
        // If the calculated date is in the past (earlier today), move it to next week
        if (startDate < today) {
          startDate.setDate(startDate.getDate() + 7);
        }
        
        const endDate = new Date(startDate);
        endDate.setHours(endHours, endMinutes, 0, 0);
        
        return {
          subject: subject.subject,
          startDate,
          endDate,
          sessions: [
            {
              startTime: availabilitySlot.startTime,
              endTime: availabilitySlot.endTime,
              workMinutes: 25,
              breakMinutes: 5,
              dayOfWeek: availabilitySlot.dayOfWeek
            }
          ]
        };
      });
      
      // Use the authenticated user ID directly from the state
      const userId = state.user.id;
      console.log("Verified authenticated user:", userId);
      
      // Save study plan to Supabase with explicit user ID
      const { data: planData, error: planError } = await supabase
        .from('study_plans')
        .insert({
          student_id: userId,
          name: 'Initial Study Plan',
          description: 'Personalized study plan based on your subjects and availability',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .select();

      if (planError) {
        console.error('Error creating study plan:', planError);
        console.error('Error details:', JSON.stringify(planError));
        toast({
          title: "Error",
          description: `Failed to create study plan: ${planError.message}`,
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }
      
      if (!planData || planData.length === 0) {
        throw new Error("Study plan was not created properly");
      }
      
      const planId = planData[0].id;
      console.log("Created study plan with ID:", planId);
      
      // Create calendar events and study plan sessions
      let successfulInserts = 0;
      const savedEvents = [];
      
      for (const planItem of planItemsWithDates) {
        const startDate = planItem.startDate;
        const endDate = planItem.endDate;
        
        // Create event description
        const eventDescription = JSON.stringify({
          subject: planItem.subject,
          topic: null,
          isPomodoro: true,
          pomodoroWorkMinutes: planItem.sessions[0].workMinutes,
          pomodoroBreakMinutes: planItem.sessions[0].breakMinutes
        });
        
        console.log(`Creating calendar event for ${planItem.subject} at ${startDate.toISOString()}`);
        
        const { data: eventData, error: eventError } = await supabase
          .from('calendar_events')
          .insert({
            student_id: userId,
            user_id: userId,
            title: `${planItem.subject} Study Session`,
            description: eventDescription,
            event_type: 'study_session',
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString()
          })
          .select();
        
        if (eventError) {
          console.error('Error creating calendar event:', eventError);
          console.error('Error details:', JSON.stringify(eventError));
          continue; // Continue with next subject instead of failing entire process
        }
        
        if (!eventData || eventData.length === 0) {
          console.warn(`No event data returned for ${planItem.subject}`);
          continue;
        }

        successfulInserts++;
        console.log(`Successfully created calendar event with ID ${eventData[0].id}`);
        
        // Format day for display
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = dayNames[startDate.getDay()];
        
        savedEvents.push({
          ...eventData[0],
          subject: planItem.subject,
          formattedStart: `${dayOfWeek}, ${format(startDate, 'h:mm a')}`,
          formattedEnd: format(endDate, 'h:mm a'),
          dayOfWeek: planItem.sessions[0].dayOfWeek
        });
        
        // Create study plan session linked to the calendar event
        const { error: sessionError } = await supabase
          .from('study_plan_sessions')
          .insert({
            plan_id: planId,
            subject: planItem.subject,
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString(),
            is_pomodoro: true,
            pomodoro_work_minutes: planItem.sessions[0].workMinutes,
            pomodoro_break_minutes: planItem.sessions[0].breakMinutes,
            calendar_event_id: eventData[0].id
          });
        
        if (sessionError) {
          console.error('Error creating study plan session:', sessionError);
          console.error('Error details:', JSON.stringify(sessionError));
        }
      }

      console.log(`Successfully created ${successfulInserts} calendar events out of ${planItemsWithDates.length} subjects`);

      if (successfulInserts === 0) {
        setError("No study sessions were scheduled. Please check your availability settings and try again.");
        toast({
          title: "Warning",
          description: "No study sessions were scheduled. Please try again or check your subjects.",
          variant: "default"
        });
      } else {
        toast({
          title: "Study Plan Created",
          description: `Successfully scheduled ${successfulInserts} study sessions.`,
        });
        setStudyPlan(planItemsWithDates);
        setCalendarEvents(savedEvents);
      }
    } catch (error) {
      console.error('Error generating study plan:', error);
      setError(error instanceof Error ? error.message : "Failed to generate study plan");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate study plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding();
      toast({
        title: "Onboarding Complete",
        description: "You're all set! Your study plan has been created.",
      });
      // Redirect to calendar or home page
      window.location.href = '/calendar';
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Log authentication state for debugging
  useEffect(() => {
    console.log("Auth state in StudyPlanGenerator:", state);
  }, [state]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Generate Your Personalized Study Plan</h2>
      
      {!state.user && !state.loading && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-amber-800">
            You need to be signed in to generate a study plan. Please refresh the page or sign in again.
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {studyPlan.length === 0 ? (
        <div className="space-y-4">
          {selectedSubjects.length === 0 && (
            <Alert className="mb-4">
              <AlertDescription>You haven't selected any subjects. Please go back to the subjects step to select at least one subject.</AlertDescription>
            </Alert>
          )}
          
          {availability.length === 0 && (
            <Alert className="mb-4">
              <AlertDescription>You haven't set your availability. Please go back to the availability step to set when you can study.</AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={generateStudyPlan} 
            disabled={isGenerating || !state.user || state.loading || selectedSubjects.length === 0 || availability.length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? 'Generating...' : 'Generate Study Plan'}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Your Study Plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {calendarEvents.map((event, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-purple-700">{event.subject} Study Session</p>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>Scheduled for {event.formattedStart}</span>
                </div>
                <div className="mt-1 flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{event.formattedStart} - {event.formattedEnd}</span>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    This session has been added to your calendar.
                  </p>
                  <Button
                    size="sm"
                    variant="link"
                    className="p-0 h-auto mt-1 text-purple-600"
                    onClick={() => window.location.href = '/calendar'}
                  >
                    View in Calendar
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button 
            onClick={handleComplete}
            className="bg-green-600 hover:bg-green-700"
          >
            Complete Onboarding
          </Button>
        </div>
      )}
    </div>
  );
};
