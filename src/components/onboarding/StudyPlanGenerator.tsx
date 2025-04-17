
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import PomodoroTimer from '@/components/PomodoroTimer';
import { useToast } from '@/hooks/use-toast';

export const StudyPlanGenerator: React.FC = () => {
  const { state } = useAuth();
  const { toast } = useToast();
  const { selectedSubjects, availability, completeOnboarding } = useOnboarding();
  const [isGenerating, setIsGenerating] = useState(false);
  const [studyPlan, setStudyPlan] = useState<any[]>([]);

  const generateStudyPlan = async () => {
    if (!state.user) return;

    setIsGenerating(true);

    try {
      // Basic study plan generation logic
      const plan = selectedSubjects.map((subject, index) => ({
        subject: subject.subject,
        sessions: [
          {
            startTime: availability[index % availability.length]?.startTime || '18:00',
            endTime: availability[index % availability.length]?.endTime || '19:30',
            workMinutes: 25,
            breakMinutes: 5
          }
        ]
      }));

      // Save study plan to Supabase
      const { data, error } = await supabase.from('study_plans').insert({
        student_id: state.user.id,
        name: 'Initial Study Plan',
        description: 'Personalized study plan based on your subjects and availability',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }).select();

      if (error) throw error;
      
      // Create calendar events and study plan sessions
      const today = new Date();
      
      for (const planItem of plan) {
        // Create a study session that starts today at the specified time
        const [hours, minutes] = planItem.sessions[0].startTime.split(':').map(Number);
        const [endHours, endMinutes] = planItem.sessions[0].endTime.split(':').map(Number);
        
        const startDate = new Date(today);
        startDate.setHours(hours, minutes, 0, 0);
        
        const endDate = new Date(today);
        endDate.setHours(endHours, endMinutes, 0, 0);
        
        // Create calendar event
        const eventDescription = JSON.stringify({
          subject: planItem.subject,
          topic: null,
          isPomodoro: true,
          pomodoroWorkMinutes: planItem.sessions[0].workMinutes,
          pomodoroBreakMinutes: planItem.sessions[0].breakMinutes
        });
        
        const { data: eventData, error: eventError } = await supabase.from('calendar_events').insert({
          student_id: state.user.id,
          user_id: state.user.id, // Make sure both student_id and user_id are set
          title: `${planItem.subject} Study Session`,
          description: eventDescription,
          event_type: 'study_session',
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString()
        }).select();
        
        if (eventError) {
          console.error('Error creating calendar event:', eventError);
          throw eventError;
        }
        
        // Create study plan session linked to the calendar event
        await supabase.from('study_plan_sessions').insert({
          plan_id: data[0].id,
          subject: planItem.subject,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          is_pomodoro: true,
          pomodoro_work_minutes: planItem.sessions[0].workMinutes,
          pomodoro_break_minutes: planItem.sessions[0].breakMinutes,
          calendar_event_id: eventData[0].id
        });
      }

      toast({
        title: "Study Plan Created",
        description: "Your study sessions have been scheduled.",
      });

      setStudyPlan(plan);
    } catch (error) {
      console.error('Error generating study plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate study plan. Please try again.",
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
      // Redirect to dashboard or home page
      window.location.href = '/dashboard';
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
      {studyPlan.length === 0 ? (
        <Button 
          onClick={generateStudyPlan} 
          disabled={isGenerating}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isGenerating ? 'Generating...' : 'Generate Study Plan'}
        </Button>
      ) : (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Your Study Plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {studyPlan.map((plan, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <p className="font-medium text-purple-700">{plan.subject} Study Session</p>
                <p className="text-sm text-gray-500 mt-1">Scheduled daily</p>
                <PomodoroTimer 
                  className="my-2"
                  onComplete={() => console.log(`${plan.subject} session completed`)}
                />
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
