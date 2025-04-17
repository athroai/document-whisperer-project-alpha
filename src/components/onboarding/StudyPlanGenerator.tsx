
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import PomodoroTimer from '@/components/PomodoroTimer';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

export const StudyPlanGenerator: React.FC = () => {
  const { state } = useAuth();
  const { toast } = useToast();
  const { selectedSubjects, availability, completeOnboarding } = useOnboarding();
  const [isGenerating, setIsGenerating] = useState(false);
  const [studyPlan, setStudyPlan] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        console.log("User authenticated:", data.user.id);
        setIsAuthenticated(true);
      } else {
        console.log("No authenticated user found");
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  const generateStudyPlan = async () => {
    if (!state.user) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to generate a study plan.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log("Generating study plan for user:", state.user.id);
      console.log("Selected subjects:", selectedSubjects);
      console.log("Availability:", availability);
      
      // Create session dates based on availability
      const today = new Date();
      const planItemsWithDates = selectedSubjects.map((subject, index) => {
        const availabilitySlot = availability[index % availability.length];
        
        if (!availabilitySlot) {
          throw new Error("No availability found. Please set your availability first.");
        }
        
        const [startHours, startMinutes] = availabilitySlot.startTime.split(':').map(Number);
        const [endHours, endMinutes] = availabilitySlot.endTime.split(':').map(Number);
        
        const startDate = new Date(today);
        startDate.setHours(startHours, startMinutes, 0, 0);
        
        const endDate = new Date(today);
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
              dayOfWeek: availabilitySlot.dayOfWeek || (new Date().getDay() || 7)
            }
          ]
        };
      });

      // Get fresh auth session
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData.user) {
        throw new Error("Authentication required. Please log in again.");
      }
      
      console.log("Verified authenticated user:", authData.user.id);

      // Try to use a service role client if needed (this might be necessary if RLS policies are being difficult)
      const client = supabase;
      
      // Save study plan to Supabase with explicit user ID
      const { data: planData, error: planError } = await client
        .from('study_plans')
        .insert({
          student_id: authData.user.id,
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
        
        const { data: eventData, error: eventError } = await client
          .from('calendar_events')
          .insert({
            student_id: authData.user.id,
            user_id: authData.user.id,
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
        savedEvents.push({
          ...eventData[0],
          subject: planItem.subject,
          formattedStart: format(startDate, 'EEEE, h:mm a'),
          dayOfWeek: planItem.sessions[0].dayOfWeek
        });
        
        // Create study plan session linked to the calendar event
        const { error: sessionError } = await client
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Generate Your Personalized Study Plan</h2>
      
      {!isAuthenticated && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-amber-800">
            You need to be signed in to generate a study plan. Please refresh the page or sign in again.
          </p>
        </div>
      )}
      
      {studyPlan.length === 0 ? (
        <Button 
          onClick={generateStudyPlan} 
          disabled={isGenerating || !isAuthenticated}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isGenerating ? 'Generating...' : 'Generate Study Plan'}
        </Button>
      ) : (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Your Study Plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {calendarEvents.map((event, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-purple-700">{event.subject} Study Session</p>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                    ID: {event.id}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>Scheduled for {event.formattedStart}</span>
                </div>
                <PomodoroTimer 
                  className="my-2"
                  onComplete={() => console.log(`${event.subject} session completed`)}
                />
                <div className="mt-2 pt-2 border-t border-gray-100">
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
