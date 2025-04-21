import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { generateDefaultStudySlots } from '@/utils/studyPlanGenerationUtils';
import { supabase } from '@/lib/supabase';
import { ConfidenceLabel } from '@/types/confidence';
import { useSessionCreation } from '@/hooks/calendar/useSessionCreation';

const PlanGenerationStep: React.FC<{
  isGenerating: boolean;
  progress: number;
  onGenerate: () => void;
  disabled: boolean;
}> = ({ isGenerating, progress, onGenerate, disabled }) => {
  return (
    <div className="space-y-4">
      {isGenerating ? (
        <div className="space-y-4">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <p className="text-center text-sm text-gray-600">
            Creating your personalized study plan ({progress}%)...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-6 bg-muted/40 rounded-lg text-center">
            <div className="mb-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <svg 
                  className="h-8 w-8 text-primary" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium">Ready to create your study plan</h3>
            <p className="text-sm text-gray-500 mt-2">
              We'll analyze your subjects, schedule, and preferences to build a personalized study plan.
            </p>
            <button
              onClick={onGenerate}
              disabled={disabled}
              className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-md"
            >
              Generate My Study Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StudyPlanCard: React.FC<{
  subject: string;
  confidence: string;
  sessionsPerWeek: number;
}> = ({ subject, confidence, sessionsPerWeek }) => {
  let colorClass = 'bg-purple-100 text-purple-800 border-purple-200';
  if (confidence === 'low') {
    colorClass = 'bg-red-100 text-red-800 border-red-200';
  } else if (confidence === 'high') {
    colorClass = 'bg-green-100 text-green-800 border-green-200';
  }
  
  return (
    <div className={`border rounded-md p-3 ${colorClass}`}>
      <div className="font-medium">{subject}</div>
      <div className="text-xs mt-1 flex items-center justify-between">
        <span>{sessionsPerWeek} sessions/week</span>
        <span className="capitalize">{confidence} confidence</span>
      </div>
    </div>
  );
};

const UpcomingSessionsList: React.FC<{
  sessions: any[];
  totalSessions: number;
}> = ({ sessions, totalSessions }) => {
  if (sessions.length === 0) {
    return <div className="text-center py-4 text-gray-500">No upcoming sessions</div>;
  }
  
  return (
    <div className="space-y-2">
      {sessions.map((session, idx) => (
        <div key={idx} className="border rounded-md p-3 bg-gray-50">
          <div className="flex justify-between">
            <div className="font-medium">{session.subject}</div>
            <div className="text-xs text-gray-500">{session.date}</div>
          </div>
          <div className="text-xs mt-1 text-gray-500">
            {session.formattedStart} - {session.formattedEnd}
          </div>
        </div>
      ))}
      {sessions.length < totalSessions && (
        <div className="text-center text-xs text-gray-500 pt-2">
          +{totalSessions - sessions.length} more sessions in your calendar
        </div>
      )}
    </div>
  );
};

const StudyPlanResults: React.FC<{
  studyPlan: any[];
  upcomingSessions: any[];
  onBack: () => void;
  onComplete: () => void;
  isSubmitting: boolean;
}> = ({ studyPlan, upcomingSessions, onBack, onComplete, isSubmitting }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
        <svg 
          className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <p className="text-green-800 text-sm">
          Your personalized study plan has been created and added to your calendar
        </p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Study Focus by Subject</h3>
          <span className="text-xs text-muted-foreground">
            {studyPlan.reduce((sum, subject) => sum + subject.sessionsPerWeek, 0)} sessions/week
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {studyPlan.map((subject, index) => (
            <StudyPlanCard
              key={index}
              subject={subject.subject}
              confidence={subject.confidence}
              sessionsPerWeek={subject.sessionsPerWeek}
            />
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="font-medium">Your Upcoming Study Sessions</h3>
        <UpcomingSessionsList
          sessions={upcomingSessions}
          totalSessions={studyPlan.reduce((sum, subject) => sum + subject.sessionsPerWeek, 0)}
        />
      </div>
      
      <div className="pt-6 flex flex-col sm:flex-row gap-3 sm:justify-between">
        <button 
          onClick={onBack}
          className="w-full sm:w-auto border border-gray-300 px-4 py-2 rounded-md bg-white hover:bg-gray-50"
        >
          Back
        </button>
        
        <button 
          onClick={onComplete}
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              Processing...
            </>
          ) : (
            <>
              <svg 
                className="h-4 w-4" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Complete Setup
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export const StudyPlanContainer: React.FC = () => {
  const { selectedSubjects, completeOnboarding, updateOnboardingStep, studySlots } = useOnboarding();
  const { state } = useAuth();
  const navigate = useNavigate();
  const { createBatchCalendarSessions } = useSessionCreation();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [studyPlan, setStudyPlan] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [createdCalendarEvents, setCreatedCalendarEvents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cleanupExistingPlan = async (userId: string) => {
    try {
      const { data: existingPlan } = await supabase
        .from('study_plans')
        .select('id')
        .eq('student_id', userId)
        .eq('is_active', true)
        .single();

      if (existingPlan) {
        const { data: planSessions } = await supabase
          .from('study_plan_sessions')
          .select('calendar_event_id')
          .eq('plan_id', existingPlan.id);
          
        if (planSessions) {
          const eventIds = planSessions
            .map(session => session.calendar_event_id)
            .filter(id => id);
            
          if (eventIds.length > 0) {
            await supabase
              .from('calendar_events')
              .delete()
              .in('id', eventIds);
          }
        }

        await Promise.all([
          supabase
            .from('study_plan_sessions')
            .delete()
            .eq('plan_id', existingPlan.id),
          supabase
            .from('study_plans')
            .delete()
            .eq('id', existingPlan.id)
        ]);
      }
    } catch (error) {
      console.error('Error cleaning up existing plan:', error);
    }
  };

  const generateStudyPlan = async () => {
    if (!state.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate a study plan",
        variant: "destructive"
      });
      return;
    }

    if (selectedSubjects.length === 0) {
      toast({
        title: "No Subjects Selected",
        description: "Please select at least one subject before generating a study plan",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);

    try {
      await cleanupExistingPlan(state.user.id);
      setGenerationProgress(15);
      
      const slotsToUse = studySlots.length > 0 ? 
        studySlots : 
        generateDefaultStudySlots(state.user.id);

      if (slotsToUse.length === 0) {
        throw new Error("No study slots are configured. Please go back and set up your study schedule.");
      }

      setGenerationProgress(30);
      
      const subjectDistribution = selectedSubjects.map(subject => ({
        subject: subject.subject,
        confidence: subject.confidence,
        sessionsPerWeek: calculateSessionsPerWeek(subject.confidence)
      }));

      setStudyPlan(subjectDistribution);
      setGenerationProgress(50);

      try {
        await Promise.all(selectedSubjects.map(subject => 
          supabase
            .from('student_subject_preferences')
            .upsert({
              student_id: state.user!.id,
              subject: subject.subject,
              confidence_level: subject.confidence,
            })
        ));
      } catch (prefError) {
        console.error("Error saving subject preferences:", prefError);
      }

      const sessions = await createStudySessions(subjectDistribution, slotsToUse);
      
      if (sessions.length === 0) {
        throw new Error("No study sessions could be generated. Please check your schedule settings.");
      }
      
      setGenerationProgress(60);

      try {
        const { data: planData, error: planError } = await supabase
          .from('study_plans')
          .insert({
            student_id: state.user.id,
            name: 'Personalized Study Plan',
            description: 'AI-generated study plan based on your subject preferences',
            start_date: new Date().toISOString().split('T')[0],
            end_date: addDays(new Date(), 30).toISOString().split('T')[0],
            is_active: true
          })
          .select()
          .single();

        if (planError) throw planError;
        
        setGenerationProgress(75);
        
        const calendarSessionsData = sessions.map(session => ({
          title: `${session.subject} Study Session`,
          subject: session.subject,
          topic: session.topic || '',
          startTime: session.startTime,
          endTime: session.endTime,
          eventType: 'study_session'
        }));
        
        const createdEvents = await createBatchCalendarSessions(calendarSessionsData);
        
        if (createdEvents.length > 0) {
          const sessionEntries = createdEvents.map((event, index) => ({
            plan_id: planData.id,
            subject: sessions[index].subject,
            topic: sessions[index].topic || '',
            start_time: event.start_time,
            end_time: event.end_time,
            calendar_event_id: event.id,
            is_pomodoro: true,
            pomodoro_work_minutes: 25,
            pomodoro_break_minutes: 5
          }));
          
          await supabase
            .from('study_plan_sessions')
            .insert(sessionEntries);
        }
        
        setCreatedCalendarEvents(createdEvents.map(e => e.id));
        setUpcomingSessions(sessions.slice(0, 5));
        setGenerationProgress(100);
        setIsComplete(true);
        
        toast({
          title: "Success",
          description: "Your personalized study plan has been created!"
        });
      } catch (planCreationError) {
        console.error("Error creating study plan:", planCreationError);
        throw new Error("Failed to create study plan. Please try again later.");
      }
    } catch (error) {
      console.error("Error generating study plan:", error);
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

  const calculateSessionsPerWeek = (confidence: ConfidenceLabel) => {
    switch(confidence) {
      case 'low': return 5;
      case 'medium': return 3;
      case 'high': return 1;
      default: return 3;
    }
  };

  const createStudySessions = async (subjectDistribution: any[], slots: any[]) => {
    const today = new Date();
    const sessions = [];
    
    let slotIndex = 0;
    for (const subjectData of subjectDistribution) {
      for (let i = 0; i < subjectData.sessionsPerWeek; i++) {
        if (slotIndex >= slots.length) {
          slotIndex = 0;
        }
        
        const slot = slots[slotIndex];
        
        const dayOfWeek = slot.day_of_week;
        const currentDay = today.getDay() || 7;
        let daysToAdd = dayOfWeek - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7;
        
        daysToAdd += Math.floor(i / slots.length) * 7;
        
        const sessionDate = addDays(today, daysToAdd);
        
        const startHour = slot.preferred_start_hour || 15;
        const sessionStartTime = new Date(sessionDate);
        sessionStartTime.setHours(startHour, 0, 0, 0);
        
        const sessionEndTime = new Date(sessionStartTime);
        sessionEndTime.setMinutes(sessionEndTime.getMinutes() + slot.slot_duration_minutes);
        
        sessions.push({
          subject: subjectData.subject,
          confidence: subjectData.confidence,
          startTime: sessionStartTime,
          endTime: sessionEndTime,
          formattedStart: format(sessionStartTime, 'EEEE, h:mm a'),
          formattedEnd: format(sessionEndTime, 'h:mm a'),
          day: format(sessionStartTime, 'EEEE'),
          date: format(sessionStartTime, 'MMM d'),
          duration: slot.slot_duration_minutes
        });
        
        slotIndex++;
      }
    }
    
    sessions.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    return sessions;
  };

  const handleBack = () => {
    updateOnboardingStep('style');
  };

  const handleComplete = async () => {
    try {
      setIsGenerating(true);
      
      if (createdCalendarEvents.length === 0) {
        console.warn("No calendar events were created during plan generation");
        toast({
          title: "Warning",
          description: "Study plan created but calendar events may be missing",
          variant: "destructive"
        });
      } else {
        console.log(`Successfully created ${createdCalendarEvents.length} calendar events`);
      }
      
      await completeOnboarding();
      toast({
        title: "Success",
        description: "Onboarding completed successfully!"
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/calendar?fromSetup=true&refresh=true');
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: "There was an error completing onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Your Personalized Study Plan</h2>
        <p className="text-muted-foreground">Let's create your AI-optimized study schedule</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {!isComplete ? (
        <PlanGenerationStep
          isGenerating={isGenerating}
          progress={generationProgress}
          onGenerate={generateStudyPlan}
          disabled={isGenerating || !state.user || selectedSubjects.length === 0}
        />
      ) : (
        <StudyPlanResults
          studyPlan={studyPlan}
          upcomingSessions={upcomingSessions}
          onBack={handleBack}
          onComplete={handleComplete}
          isSubmitting={isGenerating}
        />
      )}
    </motion.div>
  );
};
