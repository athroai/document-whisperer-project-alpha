
import React from 'react';
import { StudentSession, SessionAction } from '@/types/monitoring';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { formatDistance } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StudentSessionModalProps {
  session: StudentSession | null;
  open: boolean;
  onClose: () => void;
}

const StudentSessionModal: React.FC<StudentSessionModalProps> = ({
  session,
  open,
  onClose,
}) => {
  if (!session) {
    return null;
  }

  // Format session duration
  const formatSessionDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Get icon/style for action type
  const getActionStyle = (actionType: string) => {
    switch (actionType) {
      case 'question':
        return { color: 'blue', label: 'Question' };
      case 'answer':
        return { color: 'green', label: 'Answer' };
      case 'navigation':
        return { color: 'purple', label: 'Navigation' };
      case 'quiz-submission':
        return { color: 'orange', label: 'Quiz Submission' };
      case 'message':
        return { color: 'gray', label: 'Message' };
      default:
        return { color: 'gray', label: actionType };
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{session.studentName}'s Session</DialogTitle>
          <DialogDescription>
            {session.subject} - {session.activityType}: {session.activityName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium">Session Start</h4>
              <p className="text-sm">
                {format(new Date(session.startTime), 'h:mm a')}
                <span className="text-xs text-muted-foreground ml-2">
                  ({formatDistance(new Date(session.startTime), new Date(), { addSuffix: true })})
                </span>
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Session Duration</h4>
              <p className="text-sm">{formatSessionDuration(session.sessionDurationSeconds)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Last Active</h4>
              <p className="text-sm">
                {format(new Date(session.lastActiveTime), 'h:mm:ss a')}
                <span className="text-xs text-muted-foreground ml-2">
                  ({formatDistance(new Date(session.lastActiveTime), new Date(), { addSuffix: true })})
                </span>
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Confidence Level</h4>
              <p className="text-sm">{session.confidence}/10</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
            {session.recentActions && session.recentActions.length > 0 ? (
              <ScrollArea className="h-[200px] rounded-md border p-2">
                {session.recentActions.map((action: SessionAction, index: number) => {
                  const style = getActionStyle(action.actionType);
                  return (
                    <div key={index} className="mb-3">
                      <div className="flex items-start">
                        <div
                          className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium bg-${style.color}-100 text-${style.color}-800 mr-2`}
                        >
                          {style.label}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(action.timestamp), 'h:mm:ss a')}
                        </span>
                      </div>
                      <p className="text-sm mt-1 ml-1">{action.content}</p>
                    </div>
                  );
                })}
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity recorded</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentSessionModal;
