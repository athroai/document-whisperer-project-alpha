
import React from 'react';
import { StudySession } from '@/types/study';

interface StudySessionCardProps {
  session: StudySession;
  isExpanded: boolean;
  onExpand: (id: string | null) => void;
  onScheduleReview?: (subject: string, topic: string | undefined, sessionId?: string) => void;
  confidenceChange?: string | null;
}

export const StudySessionCard: React.FC<StudySessionCardProps> = ({
  session,
  isExpanded,
  onExpand,
  onScheduleReview,
  confidenceChange,
}) => {
  return (
    <div className="border rounded-lg shadow-sm transition-all bg-white">
      <div
        className={`flex justify-between items-center p-4 cursor-pointer`}
        onClick={() => onExpand && onExpand(isExpanded ? null : session.id)}
      >
        <div>
          <div className="font-semibold">{session.subject}</div>
          <div className="text-xs text-gray-500">{session.topic || ''}</div>
        </div>
        <div className="text-right">
          {confidenceChange && (
            <span className="text-xs font-medium text-blue-500">{confidenceChange}</span>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="bg-gray-50 px-4 pb-4 text-sm">
          {session.notes && <div className="mb-2">Notes: {session.notes}</div>}
          {onScheduleReview && (
            <button
              className="text-purple-600 underline decoration-dotted"
              onClick={(e) => {
                e.stopPropagation();
                onScheduleReview(session.subject, session.topic, session.id);
              }}
            >
              Schedule a review
            </button>
          )}
        </div>
      )}
    </div>
  );
};

