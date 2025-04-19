import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { StudyPlanCard } from './plan/StudyPlanCard';
import { UpcomingSessionsList } from './plan/UpcomingSessionsList';
import { PlanGenerationStep } from './plan/PlanGenerationStep';
import { generateDefaultStudySlots, saveStudyPlan } from '@/utils/studyPlanUtils';

export const StudyPlanStep: React.FC = () => {
  const { selectedSubjects, completeOnboarding, updateOnboardingStep, studySlots } = useOnboarding();
  const { state } = useAuth();
  const navigate = useNavigate();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [studyPlan, setStudyPlan] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);

  useEffect(() => {
    if (selectedSubjects.length > 0) {
      generateStudyPlan();
    }
  }, []);

  const generateStudyPlan = async () => {
    if (!state.user) {
      toast.error("You need to be logged in to generate a study plan");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Use existing slots or generate defaults
      const slotsToUse = studySlots.length > 0 ? 
        studySlots : 
        generateDefaultStudySlots(state.user.id);

      // Calculate sessions per subject based on confidence
      const subjectDistribution = selectedSubjects.map(subject => {
        let sessionsPerWeek = 3;
        
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

      setStudyPlan(subjectDistribution);
      setGenerationProgress(50);

      // Generate session schedule
      const sessions = await createSessions(subjectDistribution, slotsToUse);
      await saveStudyPlan(state.user.id, subjectDistribution, sessions);
      
      setUpcomingSessions(sessions.slice(0, 5));
      setIsComplete(true);
      setGenerationProgress(100);
      
      toast.success("Your personalized study plan has been created!");
    } catch (error) {
      console.error("Error generating study plan:", error);
      toast.error("Failed to generate study plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const createSessions = async (subjectDistribution: any[], slots: any[]) => {
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
      
      {!isComplete ? (
        <PlanGenerationStep
          isGenerating={isGenerating}
          progress={generationProgress}
          onGenerate={generateStudyPlan}
          disabled={isGenerating || !state.user}
        />
      ) : (
        <>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <p className="text-green-800 text-sm">
              Your personalized study plan has been created based on your preferences and learning style
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium">Study Focus by Subject</h3>
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
                'Complete Setup & Go to Calendar'
              )}
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
};
