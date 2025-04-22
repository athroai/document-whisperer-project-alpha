
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StudyPreferences } from '@/components/onboarding/core/StudyPreferences';
import { SubjectSelector } from '@/components/onboarding/core/SubjectSelector';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface WeeklyPlanningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export const WeeklyPlanningDialog: React.FC<WeeklyPlanningDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading
}) => {
  const [preferences, setPreferences] = React.useState({
    focusMode: 'pomodoro' as const,
    preferredTime: 'morning' as const,
    reviewFrequency: 'daily' as const
  });

  const [subjects, setSubjects] = React.useState<{ subject: string; confidence: 'low' | 'medium' | 'high' }[]>([]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Plan Your Study Week</DialogTitle>
          <DialogDescription>
            Set your preferences for this week's study sessions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">Weekly Subject Focus</h3>
            <SubjectSelector
              subjects={subjects}
              updateSubjects={setSubjects}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Study Preferences</h3>
            <StudyPreferences
              preferences={preferences}
              updatePreferences={setPreferences}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading || subjects.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Planning...
                </>
              ) : (
                'Generate Weekly Plan'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
