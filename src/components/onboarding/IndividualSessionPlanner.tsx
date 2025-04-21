
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { DayTimePreferences } from './DayTimePreferences';
import { Badge } from '@/components/ui/badge';
import { DaySelector } from './DaySelector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';

interface SessionTime {
  startHour: number;
  durationMinutes: number;
}

interface DayPreference {
  dayIndex: number;
  sessionTimes: SessionTime[];
}

interface IndividualSessionPlannerProps {
  selectedDays: number[];
  handleDayToggle: (dayIndex: number) => void;
  dayPreferences: DayPreference[];
  handleSessionTimeChange: (dayIndex: number, sessionIndex: number, hour: number) => void;
  handleSessionDurationChange: (dayIndex: number, sessionIndex: number, minutes: number) => void;
  handleAddSession: (dayIndex: number) => void;
  handleRemoveSession: (dayIndex: number, sessionIndex: number) => void;
  sessionsPerDay: number;
}

export const IndividualSessionPlanner: React.FC<IndividualSessionPlannerProps> = ({
  selectedDays,
  handleDayToggle,
  dayPreferences,
  handleSessionTimeChange,
  handleSessionDurationChange,
  handleAddSession,
  handleRemoveSession,
  sessionsPerDay
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Study Days</CardTitle>
        </CardHeader>
        <CardContent>
          <DaySelector 
            selectedDays={selectedDays} 
            toggleDaySelection={handleDayToggle}
          />
          
          <Alert className="mt-4 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-800" />
            <AlertDescription className="text-sm text-blue-800">
              Select the days you want to study, then customize each day's sessions below.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      
      {selectedDays.length === 0 ? (
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            Please select at least one day to customize your study sessions.
          </AlertDescription>
        </Alert>
      ) : (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Customize Your Sessions</h3>
            <p className="text-sm text-gray-600">
              For each day, set your preferred study times and durations. You can add multiple sessions per day.
            </p>
          </div>
          
          <div className="space-y-4">
            {selectedDays.map((dayIndex) => (
              <DayTimePreferences
                key={dayIndex}
                dayIndex={dayIndex}
                dayName={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIndex - 1]}
                isSelected={true}
                sessionsCount={sessionsPerDay}
                sessionTimes={
                  dayPreferences.find(p => p.dayIndex === dayIndex)?.sessionTimes || 
                  Array(sessionsPerDay).fill({ startHour: 15, durationMinutes: 45 })
                }
                onSessionTimeChange={handleSessionTimeChange}
                onSessionDurationChange={handleSessionDurationChange}
                onAddSession={handleAddSession}
                onRemoveSession={handleRemoveSession}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
