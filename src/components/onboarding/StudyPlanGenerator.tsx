import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import PomodoroTimer from '@/components/PomodoroTimer';

export const StudyPlanGenerator: React.FC = () => {
  const { state } = useAuth();
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

      // Save study plan sessions
      const sessionPromises = plan.map(planItem => 
        supabase.from('study_plan_sessions').insert({
          plan_id: data[0].id,
          subject: planItem.subject,
          start_time: planItem.sessions[0].startTime,
          end_time: planItem.sessions[0].endTime,
          is_pomodoro: true,
          pomodoro_work_minutes: planItem.sessions[0].workMinutes,
          pomodoro_break_minutes: planItem.sessions[0].breakMinutes
        })
      );

      await Promise.all(sessionPromises);

      setStudyPlan(plan);
    } catch (error) {
      console.error('Error generating study plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = async () => {
    await completeOnboarding();
    // Redirect to dashboard or home page
    window.location.href = '/dashboard';
  };

  return (
    <div className="space-y-4">
      <h2>Generate Your Personalized Study Plan</h2>
      {studyPlan.length === 0 ? (
        <Button 
          onClick={generateStudyPlan} 
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Study Plan'}
        </Button>
      ) : (
        <div>
          <h3>Your Study Plan</h3>
          {studyPlan.map((plan, index) => (
            <div key={index} className="mb-4">
              <p>{plan.subject} Study Session</p>
              <PomodoroTimer 
                initialWorkMinutes={plan.sessions[0].workMinutes}
                initialBreakMinutes={plan.sessions[0].breakMinutes}
              />
            </div>
          ))}
          <Button onClick={handleComplete}>Complete Onboarding</Button>
        </div>
      )}
    </div>
  );
};
