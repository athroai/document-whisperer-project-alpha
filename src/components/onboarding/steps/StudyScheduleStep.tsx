
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IndividualSessionPlanner } from '../IndividualSessionPlanner';
import { Info, AlertCircle, Clock } from 'lucide-react';
import { useStudySchedule } from '@/hooks/useStudySchedule';

export const StudyScheduleStep: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateOnboardingStep } = useOnboarding();
  const {
    selectedDays,
    sessionsPerDay,
    dayPreferences,
    sessionOptions,
    handleDayToggle,
    handleSessionTimeChange,
    handleSessionDurationChange,
    handleSessionsPerDayChange,
    handleAddSession,
    handleRemoveSession,
    handleContinue,
    error
  } = useStudySchedule();

  const onContinue = async () => {
    try {
      setIsSubmitting(true);
      await handleContinue();
      updateOnboardingStep('plan');
    } catch (error) {
      console.error('Error saving schedule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Your Study Schedule</h2>
        <p className="text-gray-600 text-sm">
          Create your personalized study schedule by selecting days and setting up individual study sessions.
        </p>
      </div>
      
      <Card className="p-4 border-purple-200">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-base font-semibold">Initial Session Format</Label>
            <span className="text-sm font-medium text-purple-700">
              {sessionsPerDay} {sessionsPerDay === 1 ? 'session' : 'sessions'} per day
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Choose starting template:</Label>
              <Select 
                value={sessionsPerDay.toString()}
                onValueChange={(value) => handleSessionsPerDayChange(parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose session format" />
                </SelectTrigger>
                <SelectContent>
                  {sessionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label} ({option.durationMinutes} min each)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-800" />
            <AlertDescription className="text-sm text-blue-800">
              After selecting a template, you can customize each session's time and duration individually below.
            </AlertDescription>
          </Alert>
        </div>
      </Card>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* This is our new component for individual session planning */}
      <IndividualSessionPlanner
        selectedDays={selectedDays}
        handleDayToggle={handleDayToggle}
        dayPreferences={dayPreferences}
        handleSessionTimeChange={handleSessionTimeChange}
        handleSessionDurationChange={handleSessionDurationChange}
        handleAddSession={handleAddSession}
        handleRemoveSession={handleRemoveSession}
        sessionsPerDay={sessionsPerDay}
      />
      
      <div className="pt-6">
        <Button
          onClick={onContinue}
          disabled={selectedDays.length === 0 || isSubmitting}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? "Saving..." : "Continue to Plan Generation"}
        </Button>
      </div>
    </div>
  );
};
