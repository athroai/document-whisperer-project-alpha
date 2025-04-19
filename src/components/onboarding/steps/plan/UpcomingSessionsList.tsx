
import React from 'react';
import { BookOpen, CalendarIcon, Clock } from 'lucide-react';

interface SessionInfo {
  subject: string;
  day: string;
  date: string;
  formattedStart: string;
  duration: number;
}

interface UpcomingSessionsListProps {
  sessions: SessionInfo[];
  totalSessions: number;
}

export const UpcomingSessionsList: React.FC<UpcomingSessionsListProps> = ({ 
  sessions,
  totalSessions 
}) => {
  return (
    <div className="space-y-3">
      {sessions.map((session, index) => (
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
      
      {sessions.length > 3 && (
        <p className="text-sm text-center text-muted-foreground">
          +{totalSessions - 5} more sessions scheduled in your calendar
        </p>
      )}
    </div>
  );
};
