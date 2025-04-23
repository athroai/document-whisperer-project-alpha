
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getEventColor } from '@/utils/calendarUtils';
import { UserSubject } from '@/hooks/useUserSubjects';
import { Loader2 } from 'lucide-react';

interface SubjectBadgesProps {
  subjects: UserSubject[];
  isLoading?: boolean;
}

const SubjectBadges: React.FC<SubjectBadgesProps> = ({ subjects, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2 mt-4 items-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading subjects...</span>
      </div>
    );
  }

  if (!subjects || subjects.length === 0) {
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        <Badge variant="outline" className="bg-gray-100 text-gray-500">
          No subjects selected
        </Badge>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Visit settings to add subjects
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {subjects.map(subj => {
        const colorStyle = getEventColor(subj.subject);
        return (
          <Badge 
            key={subj.subject}
            className={`${colorStyle.bg} ${colorStyle.text} hover:${colorStyle.bg}`}
          >
            {subj.subject}
          </Badge>
        );
      })}
      
      {subjects.length > 0 && (
        <Badge variant="outline" className="bg-gray-50 text-gray-500">
          {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
};

export default SubjectBadges;
