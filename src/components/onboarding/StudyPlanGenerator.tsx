import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { supabase, verifyAuth } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon, Clock, BookOpen, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PreferredStudySlot } from '@/types/study';

export const StudyPlanGenerator: React.FC = () => {
  const { state } = useAuth();
  const { toast } = useToast();
  const { selectedSubjects, completeOnboarding, updateOnboardingStep, studySlots } = useOnboarding();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerationComplete, setIsGenerationComplete] = useState(false);
  const [studyPlan, setStudyPlan] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [authVerified, setAuthVerified] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<Record<string, number>>({});
  const [generationProgress, setGenerationProgress] = useState(0);
  const [localStudySlots, setLocalStudySlots] = useState<PreferredStudySlot[]>([]);

  useEffect(() => {
    const fetchDiagnosticResults = async () => {
      if (!state.user) return;

      try {
        const { data, error } = await supabase
          .from('diagnostic_results')
          .select('subject_name, percentage_accuracy')
          .eq('student_id', state.user.id);

        if (error) throw error;

        const resultsMap: Record<string, number> = {};
        data?.forEach(item => {
          resultsMap[item.subject_name] = item.percentage_accuracy;
        });

        setDiagnosticResults(resultsMap);
      } catch (error) {
        console.error('Error fetching diagnostic results:', error);
      }
    };

    fetchDiagnosticResults();
  }, [state.user]);

  useEffect(() => {
    if (studySlots && studySlots.length > 0) {
      console.log('Using study slots from context:', studySlots);
      setLocalStudySlots(studySlots);
      return;
    }
    
    const fetchStudySlots = async () => {
      if (!state.user) return;
      
      try {
        const { data, error } = await supabase
          .from('preferred_study_slots')
          .select('*')
          .eq('user_id', state.user.id);
          
        if (error) {
          console.error('Error fetching study slots:', error);
          return;
        }
        
        if (data && data.length > 0) {
          console.log('Found study slots from database:', data);
          setLocalStudySlots(data);
        } else {
          console.warn('No study slots found in database for user:', state.user.id);
        }
      } catch (err) {
        console.error('Exception when fetching study slots:', err);
      }
    };
    
    if (state.user) {
      fetchStudySlots();
    }
  }, [state.user, studySlots]);

  useEffect(() => {
    const checkAuth = async () => {
      const supabaseUser = await verifyAuth();
      if (supabaseUser) {
        setAuthVerified(true);
      } else {
        setAuthVerified(false);
        setError("Authentication error: You need to be signed in to generate a study plan.");
      }
    };

    if (state.user) {
      checkAuth();
    }
  }, [state.user]);

  const calculateSessionsPerWeek = (score: number | undefined) => {
    if (score === undefined) return 3;

    if (score < 50) return 4;
    if (score <= 80) return Math.round(3.5 - (score - 50) * 0.03);
    return 1;
  };

  const generateDefaultStudySlots = (): PreferredStudySlot[] => {
    if (!state.user) return [];
    
    const defaultSlots: PreferredStudySlot[] = [];
    
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
    
    console.log('Generated default study slots:', defaultSlots);
    return defaultSlots;
  };

  const generateStudyPlan = async () => {
    setError(null);
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      if (!state.user) {
        toast({
          title: "Authentication Required",
          description: "You need to be signed in to generate a study plan.",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }

      if (!authVerified) {
        toast({
          title: "Authentication Error",
          description: "You're not properly authenticated. Please refresh the page or sign in again.",
          variant: "destructive"
        });
        setIsGenerating(false);
        setError("Authentication error with Supabase. Please refresh the page.");
        return;
      }

      setGenerationProgress(10);

      if (!selectedSubjects || selectedSubjects.length === 0) {
        setError("No subjects selected. Please go back to the subjects step and select at least one subject.");
        setIsGenerating(false);
        return;
      }

      let slotsToUse = localStudySlots;
      
      if (!slotsToUse || slotsToUse.length === 0) {
        console.log('No stored study slots found, generating default slots');
        slotsToUse = generateDefaultStudySlots();
        setLocalStudySlots(slotsToUse);
      }
      
      if (slotsToUse.length === 0) {
        setError("Could not generate study slots. Please try refreshing the page.");
        setIsGenerating(false);
        return;
      }

      setGenerationProgress(30);

      const { data: planData, error: planError } = await supabase
        .from('study_plans')
        .insert({
          student_id: state.user.id,
          name: 'Personalized Study Plan',
          description: 'AI-generated study plan based on your subject preferences and quiz results',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .select();

      if (planError) {
        console.error('Error creating study plan:', planError);
        throw planError;
      }

      if (!planData || planData.length === 0) {
        throw new Error("Failed to create study plan");
      }

      const planId = planData[0].id;
      setGenerationProgress(50);

      const sessionDistribution = selectedSubjects.map(subject => {
        const score = diagnosticResults[subject.subject];
        const sessionsPerWeek = calculateSessionsPerWeek(score);
        
        return {
          subject: subject.subject,
          sessionsPerWeek,
          score: score
        };
      });

      const today = new Date();
      const savedEvents = [];
      
      const sortedSlots = [...slotsToUse].sort((a, b) => a.day_of_week - b.day_of_week);
      
      let createdSessions = 0;
      const totalSessions = sessionDistribution.reduce((sum, item) => sum + item.sessionsPerWeek, 0);
      
      let slotIndex = 0;
      for (const subjectData of sessionDistribution) {
        for (let i = 0; i < subjectData.sessionsPerWeek; i++) {
          if (slotIndex >= sortedSlots.length) {
            slotIndex = 0;
          }
          
          const slot = sortedSlots[slotIndex];
          
          const currentDay = today.getDay();
          const targetDay = slot.day_of_week;
          
          let daysToAdd = targetDay - currentDay;
          if (daysToAdd <= 0) daysToAdd += 7;
          
          daysToAdd += Math.floor(createdSessions / sortedSlots.length) * 7;
          
          const sessionDate = addDays(today, daysToAdd);
          const startHour = slot.preferred_start_hour || 9;
          
          const startTime = new Date(sessionDate);
          startTime.setHours(startHour, 0, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + slot.slot_duration_minutes);
          
          const eventDescription = JSON.stringify({
            subject: subjectData.subject,
            topic: null,
            isPomodoro: true,
            pomodoroWorkMinutes: Math.min(slot.slot_duration_minutes, 25),
            pomodoroBreakMinutes: 5
          });

          let sessionTitle = `${subjectData.subject} Study Session`;
          if (subjectData.score !== undefined) {
            if (subjectData.score < 50) {
              sessionTitle = `${subjectData.subject} Intensive Review`;
            } else if (subjectData.score < 80) {
              sessionTitle = `${subjectData.subject} Practice`;
            } else {
              sessionTitle = `${subjectData.subject} Mastery`;
            }
          }
          
          try {
            const { data: eventData, error: eventError } = await supabase
              .from('calendar_events')
              .insert({
                student_id: state.user.id,
                user_id: state.user.id,
                title: sessionTitle,
                description: eventDescription,
                event_type: 'study_session',
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString()
              })
              .select();
              
            if (eventError) {
              console.error('Error creating calendar event:', eventError);
              continue;
            }
            
            if (eventData && eventData.length > 0) {
              await supabase
                .from('study_plan_sessions')
                .insert({
                  plan_id: planId,
                  subject: subjectData.subject,
                  start_time: startTime.toISOString(),
                  end_time: endTime.toISOString(),
                  is_pomodoro: true,
                  pomodoro_work_minutes: Math.min(slot.slot_duration_minutes, 25),
                  pomodoro_break_minutes: 5,
                  calendar_event_id: eventData[0].id
                }).then(({ error }) => {
                  if (error) console.error('Error creating study plan session:', error);
                });
                
              savedEvents.push({
                ...eventData[0],
                subject: subjectData.subject,
                formattedStart: format(startTime, 'EEEE, h:mm a'),
                formattedEnd: format(endTime, 'h:mm a')
              });
            }
          } catch (err) {
            console.error('Error creating events:', err);
          }
          
          slotIndex++;
          createdSessions++;
          
          setGenerationProgress(50 + Math.floor((createdSessions / totalSessions) * 50));
        }
      }

      setCalendarEvents(savedEvents);
      setStudyPlan(sessionDistribution);
      setIsGenerationComplete(true);
      setGenerationProgress(100);
      
      toast({
        title: "Study Plan Created",
        description: `Successfully scheduled ${savedEvents.length} study sessions.`,
      });

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
      setIsSubmitting(true);
      
      // Save to database if user exists
      if (state.user) {
        await completeOnboarding();
      }
      
      toast({
        title: "Success",
        description: "Your study plan has been created successfully!",
      });
      
      // Navigate to calendar with the fromSetup parameter to trigger the success message
      window.location.href = '/calendar?fromSetup=true';
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {!authVerified && state.user && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-amber-800">
            Supabase authentication not verified. Please refresh the page or sign in again.
          </p>
        </div>
      )}

      {!state.user && !state.isLoading && (
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
      
      {isGenerating && (
        <div className="space-y-4 py-8">
          <h3 className="text-lg font-medium text-center">Creating Your Personalized Study Plan</h3>
          <Progress value={generationProgress} className="w-full" />
          <p className="text-center text-sm text-gray-500">
            Analyzing your quiz results and scheduling optimal study sessions...
          </p>
        </div>
      )}
      
      {!isGenerationComplete && !isGenerating ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Generate Your Personalized Study Plan</h3>
            <p className="text-gray-600 mb-6">
              Based on your subject selections and diagnostic quiz results, we'll create a 
              personalized study schedule in your calendar. The plan will:
            </p>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Schedule more sessions for subjects where you need more practice</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Fit study sessions into your selected time slots</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Create a balanced weekly schedule across all your subjects</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Adjust session content based on your confidence levels</span>
              </li>
            </ul>
            
            <Button 
              onClick={generateStudyPlan} 
              disabled={isGenerating || !state.user || state.isLoading || selectedSubjects.length === 0 || !authVerified}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? 'Generating Plan...' : 'Generate My Study Plan'}
            </Button>
          </div>
        </div>
      ) : null}
      
      {isGenerationComplete && calendarEvents.length > 0 && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-800">
              Your personalized study plan has been created! Here's your schedule:
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Study Sessions by Subject</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {studyPlan.map((subject, index) => (
                <Card key={index} className="p-4 border">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{subject.subject}</h4>
                    <div 
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        subject.score < 50 ? 'bg-red-100 text-red-800' : 
                        subject.score < 80 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}
                    >
                      {subject.score !== undefined ? `${subject.score}%` : 'No Quiz'}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Sessions per week: {subject.sessionsPerWeek}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {subject.score < 50 
                        ? 'Focus area: Intensive review needed' 
                        : subject.score < 80 
                          ? 'Focus area: Continued practice' 
                          : 'Focus area: Mastery and advanced topics'}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
            
            <h3 className="text-lg font-medium mt-8">Your Upcoming Study Sessions</h3>
            <div className="space-y-3">
              {calendarEvents.slice(0, 5).map((event, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${
                    subjectColorMap[event.subject] || defaultColor
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex items-center mt-1 text-sm">
                        <Clock className="h-4 w-4 mr-1 opacity-70" />
                        <span>{event.formattedStart} - {event.formattedEnd}</span>
                      </div>
                    </div>
                    <BookOpen className="h-5 w-5 opacity-70" />
                  </div>
                </div>
              ))}
              
              {calendarEvents.length > 5 && (
                <p className="text-sm text-center text-gray-500">
                  +{calendarEvents.length - 5} more sessions scheduled in your calendar
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/calendar'} 
              className="flex items-center"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              View Full Calendar
            </Button>
            <Button 
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              Complete Setup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const subjectColorMap: Record<string, string> = {
  'Mathematics': 'bg-purple-100 border-purple-300',
  'Science': 'bg-blue-100 border-blue-300',
  'English': 'bg-green-100 border-green-300',
  'History': 'bg-amber-100 border-amber-300',
  'Geography': 'bg-teal-100 border-teal-300',
  'Welsh': 'bg-red-100 border-red-300',
  'Languages': 'bg-indigo-100 border-indigo-300',
  'Religious Education': 'bg-pink-100 border-pink-300'
};

const defaultColor = 'bg-gray-100 border-gray-300';
