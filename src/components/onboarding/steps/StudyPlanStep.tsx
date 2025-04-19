
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  CalendarIcon, 
  CheckCircle, 
  ChevronLeft, 
  BookOpen,
  Clock,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, addDays } from 'date-fns';

export const StudyPlanStep: React.FC = () => {
  const { selectedSubjects, completeOnboarding, updateOnboardingStep, studySlots } = useOnboarding();
  const { state } = useAuth();
  const navigate = useNavigate();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [studyPlan, setStudyPlan] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);

  // Use effect to simulate plan generation when component loads
  useEffect(() => {
    // Auto-generate plan on component load
    generateStudyPlan();
  }, []);

  const generateStudyPlan = async () => {
    if (!state.user) {
      toast.error("You need to be logged in to generate a study plan");
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      // Simulate API call with progressive updates
      await simulateProgressiveGeneration();
      
      // Create study plan with sessions
      const plan = await createStudyPlan();
      setStudyPlan(plan.subjectDistribution);
      setUpcomingSessions(plan.sessions.slice(0, 5));
      
      setIsComplete(true);
      toast.success("Your personalized study plan is ready!");
    } catch (error) {
      console.error("Error generating study plan:", error);
      toast.error("Failed to generate study plan. Please try again.");
    } finally {
      setIsGenerating(false);
      setGenerationProgress(100);
    }
  };

  const simulateProgressiveGeneration = async () => {
    const steps = [
      { progress: 10, delay: 300, message: "Analyzing your subject preferences..." },
      { progress: 25, delay: 500, message: "Calculating optimal study patterns..." },
      { progress: 40, delay: 600, message: "Creating personalized schedule..." },
      { progress: 60, delay: 700, message: "Generating subject distribution..." },
      { progress: 75, delay: 500, message: "Optimizing for your learning style..." },
      { progress: 90, delay: 800, message: "Finalizing your study plan..." }
    ];
    
    for (const step of steps) {
      setGenerationProgress(step.progress);
      toast.info(step.message);
      await new Promise(resolve => setTimeout(resolve, step.delay));
    }
  };

  const createStudyPlan = async () => {
    // Use existing slots or generate default ones
    const slots = studySlots.length > 0 ? 
      studySlots : 
      generateDefaultStudySlots();
    
    // Sort slots by day of week
    const sortedSlots = [...slots].sort((a, b) => a.day_of_week - b.day_of_week);
    
    // Calculate sessions per subject based on confidence
    const subjectDistribution = selectedSubjects.map(subject => {
      let sessionsPerWeek = 3; // Default
      
      // Adjust based on confidence
      switch(subject.confidence) {
        case 'Very Low':
          sessionsPerWeek = 5;
          break;
        case 'Low':
          sessionsPerWeek = 4;
          break;
        case 'Neutral':
          sessionsPerWeek = 3;
          break;
        case 'High':
          sessionsPerWeek = 2;
          break;
        case 'Very High':
          sessionsPerWeek = 1;
          break;
      }
      
      return {
        subject: subject.subject,
        confidence: subject.confidence,
        sessionsPerWeek
      };
    });
    
    // Create sessions
    const today = new Date();
    const sessions = [];
    
    // Track how many sessions we've created for distribution
    let slotIndex = 0;
    for (const subjectData of subjectDistribution) {
      for (let i = 0; i < subjectData.sessionsPerWeek; i++) {
        if (slotIndex >= sortedSlots.length) {
          slotIndex = 0; // Loop back to first day if needed
        }
        
        const slot = sortedSlots[slotIndex];
        
        // Calculate the next occurrence of this day of week
        const dayOfWeek = slot.day_of_week; // 1 = Monday, 7 = Sunday
        const currentDay = today.getDay() || 7; // getDay: 0 = Sunday, 6 = Saturday, convert to 1-7
        let daysToAdd = dayOfWeek - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7; // Move to next week if day already passed
        
        // Adjust for multiple sessions per week
        daysToAdd += Math.floor(i / sortedSlots.length) * 7;
        
        // Create the session date
        const sessionDate = addDays(today, daysToAdd);
        
        // Calculate start time
        const startHour = slot.preferred_start_hour || 15; // Default to 3 PM
        const sessionStartTime = new Date(sessionDate);
        sessionStartTime.setHours(startHour, 0, 0, 0);
        
        // Calculate end time based on duration
        const sessionEndTime = new Date(sessionStartTime);
        sessionEndTime.setMinutes(sessionEndTime.getMinutes() + slot.slot_duration_minutes);
        
        // Create a session object
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
    
    // Sort sessions by date/time
    sessions.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    // In a real implementation, you would save these to your database
    try {
      if (state.user?.id) {
        await saveStudyPlan(subjectDistribution, sessions);
      }
    } catch (error) {
      console.error("Error saving study plan:", error);
      // Continue with local data even if saving fails
    }
    
    return {
      subjectDistribution,
      sessions
    };
  };

  const generateDefaultStudySlots = () => {
    if (!state.user) return [];
    
    const defaultSlots = [];
    
    // Generate default slots for weekdays (Monday to Friday)
    for (let day = 1; day <= 5; day++) {
      defaultSlots.push({
        id: `default-${day}`,
        user_id: state.user.id,
        day_of_week: day,
        slot_count: 2,
        slot_duration_minutes: 45,
        preferred_start_hour: 16
      });
    }
    
    return defaultSlots;
  };

  const saveStudyPlan = async (subjectDistribution: any[], sessions: any[]) => {
    if (!state.user?.id) return;
    
    // Create study plan record
    const { data: planData, error: planError } = await supabase
      .from('study_plans')
      .insert({
        student_id: state.user.id,
        name: 'Personalized Study Plan',
        description: 'AI-generated study plan based on your subject preferences',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      .select();
    
    if (planError) throw planError;
    if (!planData || planData.length === 0) throw new Error("Failed to create study plan");
    
    const planId = planData[0].id;
    
    // Save calendar events and sessions
    for (const session of sessions) {
      try {
        // Create calendar event
        const { data: eventData, error: eventError } = await supabase
          .from('calendar_events')
          .insert({
            student_id: state.user.id,
            user_id: state.user.id,
            title: `${session.subject} Study Session`,
            description: JSON.stringify({
              subject: session.subject,
              isPomodoro: true,
              pomodoroWorkMinutes: 25,
              pomodoroBreakMinutes: 5
            }),
            event_type: 'study_session',
            start_time: session.startTime.toISOString(),
            end_time: session.endTime.toISOString()
          })
          .select();
          
        if (eventError) {
          console.error('Error creating calendar event:', eventError);
          continue;
        }
        
        if (eventData && eventData.length > 0) {
          // Create study plan session
          await supabase
            .from('study_plan_sessions')
            .insert({
              plan_id: planId,
              subject: session.subject,
              start_time: session.startTime.toISOString(),
              end_time: session.endTime.toISOString(),
              is_pomodoro: true,
              pomodoro_work_minutes: 25,
              pomodoro_break_minutes: 5,
              calendar_event_id: eventData[0].id
            });
        }
      } catch (err) {
        console.error("Error saving session:", err);
      }
    }
  };

  const handleBack = () => {
    updateOnboardingStep('style');
  };

  const handleComplete = async () => {
    try {
      setIsGenerating(true);
      await completeOnboarding();
      toast.success("Onboarding completed successfully!");
      navigate('/calendar');
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("There was an error completing onboarding. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getConfidenceColor = (confidence: string): string => {
    switch (confidence) {
      case 'Very Low':
        return 'bg-red-100 text-red-800';
      case 'Low':
        return 'bg-orange-100 text-orange-800';
      case 'Neutral':
        return 'bg-blue-100 text-blue-800';
      case 'High':
        return 'bg-green-100 text-green-800';
      case 'Very High':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isGenerating || generationProgress < 100) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 py-8 text-center"
      >
        <Sparkles className="h-12 w-12 text-purple-500 mx-auto" />
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Creating Your Study Plan</h2>
          <p className="text-muted-foreground mt-2">
            We're using AI to craft a personalized study schedule based on your preferences
          </p>
        </div>
        
        <div className="w-full max-w-md mx-auto">
          <Progress value={generationProgress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {generationProgress}% complete
          </p>
        </div>
        
        <div className="animate-pulse text-purple-500">
          <p className="text-sm">Analyzing your learning profile...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Your Personalized Study Plan</h2>
        <p className="text-muted-foreground">Your AI-optimized study schedule is ready to go!</p>
      </div>
      
      {isComplete && (
        <>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <p className="text-green-800 text-sm">
              Your personalized study plan has been created based on your preferences and learning style
            </p>
          </div>
          
          {/* Subject Distribution */}
          <div className="space-y-3">
            <h3 className="font-medium">Study Focus by Subject</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {studyPlan.map((subject, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="border-b p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{subject.subject}</h4>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(subject.confidence)}`}>
                          {subject.confidence}
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sessions per week:</span>
                        <span className="font-medium">{subject.sessionsPerWeek}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Upcoming Sessions */}
          <div className="space-y-3">
            <h3 className="font-medium">Your Upcoming Study Sessions</h3>
            <div className="space-y-3">
              {upcomingSessions.map((session, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <BookOpen className="h-5 w-5 text-purple-700" />
                    </div>
                    <div>
                      <h4 className="font-medium">{session.subject}</h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        <span>{session.day}, {session.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{session.formattedStart}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{session.duration} min</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {upcomingSessions.length > 3 && (
                <p className="text-sm text-center text-muted-foreground">
                  +{studyPlan.reduce((sum, subject) => sum + subject.sessionsPerWeek, 0) - 5} more sessions scheduled in your calendar
                </p>
              )}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={handleComplete}
              disabled={isGenerating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  Complete Setup & Go to Calendar
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
};
