
import React from 'react';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';

interface UpcomingSessionsListProps {
  sessions: any[];
  totalSessions: number;
}

export const UpcomingSessionsList: React.FC<UpcomingSessionsListProps> = ({ 
  sessions,
  totalSessions
}) => {
  // Get color class based on subject
  const getSubjectColorClass = (subject: string) => {
    const subjectColorMap: Record<string, string> = {
      'Mathematics': 'bg-purple-50 border-purple-200',
      'Science': 'bg-blue-50 border-blue-200',
      'English': 'bg-green-50 border-green-200',
      'History': 'bg-amber-50 border-amber-200',
      'Geography': 'bg-teal-50 border-teal-200',
      'Welsh': 'bg-red-50 border-red-200',
      'Languages': 'bg-indigo-50 border-indigo-200',
      'Religious Education': 'bg-pink-50 border-pink-200'
    };
    
    return subjectColorMap[subject] || 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-3">
      {sessions.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No sessions scheduled yet</p>
        </div>
      ) : (
        <>
          {sessions.map((session, index) => (
            <div 
              key={index}
              className={`rounded-lg border p-3 ${getSubjectColorClass(session.subject)}`}
            >
              <div className="flex justify-between">
                <div>
                  <h4 className="font-medium">{session.subject}</h4>
                  <div className="flex items-center mt-1 text-xs text-gray-500 gap-2">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{session.day}, {session.date}</span>
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-500 gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{session.formattedStart} - {session.formattedEnd}</span>
                </div>
              </div>
            </div>
          ))}
          
          {totalSessions > sessions.length && (
            <p className="text-xs text-center text-muted-foreground">
              +{totalSessions - sessions.length} more sessions scheduled in your calendar
            </p>
          )}
        </>
      )}
    </div>
  );
};
