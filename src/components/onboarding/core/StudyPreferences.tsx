
import React from 'react';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface StudyPreferencesProps {
  preferences: {
    focusMode: 'pomodoro' | 'continuous';
    preferredTime: 'morning' | 'afternoon' | 'evening';
    reviewFrequency: 'daily' | 'weekly';
  };
  updatePreferences: (preferences: {
    focusMode: 'pomodoro' | 'continuous';
    preferredTime: 'morning' | 'afternoon' | 'evening';
    reviewFrequency: 'daily' | 'weekly';
  }) => void;
}

export const StudyPreferences: React.FC<StudyPreferencesProps> = ({
  preferences,
  updatePreferences,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Learning Preferences</h2>
        <p className="text-gray-600">
          Customize your learning experience to match how you prefer to study.
        </p>
      </div>

      <Card className="p-5">
        <h3 className="text-lg font-medium mb-4">Focus Mode</h3>
        <RadioGroup
          value={preferences.focusMode}
          onValueChange={(value) => updatePreferences({ ...preferences, focusMode: value as 'pomodoro' | 'continuous' })}
          className="space-y-4"
        >
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="pomodoro" id="pomodoro" />
            <Label htmlFor="pomodoro" className="font-normal cursor-pointer">
              <div className="font-medium">Pomodoro Technique</div>
              <div className="text-sm text-gray-500">
                Study in focused bursts (25 min) with short breaks (5 min) between. Great for maintaining concentration!
              </div>
            </Label>
          </div>
          
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="continuous" id="continuous" />
            <Label htmlFor="continuous" className="font-normal cursor-pointer">
              <div className="font-medium">Continuous Study</div>
              <div className="text-sm text-gray-500">
                Study for the entire session without structured breaks. Good for deep work and complex topics.
              </div>
            </Label>
          </div>
        </RadioGroup>
      </Card>

      <Card className="p-5">
        <h3 className="text-lg font-medium mb-4">Preferred Study Time</h3>
        <RadioGroup
          value={preferences.preferredTime}
          onValueChange={(value) => updatePreferences({ ...preferences, preferredTime: value as 'morning' | 'afternoon' | 'evening' })}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Label
            htmlFor="morning"
            className={`flex items-center space-x-2 border rounded-md p-4 cursor-pointer ${
              preferences.preferredTime === 'morning' ? "border-purple-500 bg-purple-50" : ""
            }`}
          >
            <RadioGroupItem value="morning" id="morning" />
            <div>
              <div className="font-medium">Morning</div>
              <div className="text-sm text-gray-500">8am - 12pm</div>
            </div>
          </Label>
          
          <Label
            htmlFor="afternoon"
            className={`flex items-center space-x-2 border rounded-md p-4 cursor-pointer ${
              preferences.preferredTime === 'afternoon' ? "border-purple-500 bg-purple-50" : ""
            }`}
          >
            <RadioGroupItem value="afternoon" id="afternoon" />
            <div>
              <div className="font-medium">Afternoon</div>
              <div className="text-sm text-gray-500">12pm - 5pm</div>
            </div>
          </Label>
          
          <Label
            htmlFor="evening"
            className={`flex items-center space-x-2 border rounded-md p-4 cursor-pointer ${
              preferences.preferredTime === 'evening' ? "border-purple-500 bg-purple-50" : ""
            }`}
          >
            <RadioGroupItem value="evening" id="evening" />
            <div>
              <div className="font-medium">Evening</div>
              <div className="text-sm text-gray-500">5pm - 10pm</div>
            </div>
          </Label>
        </RadioGroup>
      </Card>

      <Card className="p-5">
        <h3 className="text-lg font-medium mb-4">Review Frequency</h3>
        <RadioGroup
          value={preferences.reviewFrequency}
          onValueChange={(value) => updatePreferences({ ...preferences, reviewFrequency: value as 'daily' | 'weekly' })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Label
            htmlFor="daily"
            className={`flex items-center space-x-2 border rounded-md p-4 cursor-pointer ${
              preferences.reviewFrequency === 'daily' ? "border-purple-500 bg-purple-50" : ""
            }`}
          >
            <RadioGroupItem value="daily" id="daily" />
            <div>
              <div className="font-medium">Daily Quick Reviews</div>
              <div className="text-sm text-gray-500">Brief daily recap of what you've learned</div>
            </div>
          </Label>
          
          <Label
            htmlFor="weekly"
            className={`flex items-center space-x-2 border rounded-md p-4 cursor-pointer ${
              preferences.reviewFrequency === 'weekly' ? "border-purple-500 bg-purple-50" : ""
            }`}
          >
            <RadioGroupItem value="weekly" id="weekly" />
            <div>
              <div className="font-medium">Weekly Deep Reviews</div>
              <div className="text-sm text-gray-500">More comprehensive weekly review sessions</div>
            </div>
          </Label>
        </RadioGroup>
      </Card>
    </div>
  );
};
