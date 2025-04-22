
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getEventColor } from '@/utils/calendarUtils';
import { UserSubject } from '@/hooks/useUserSubjects';

interface SubjectBadgesProps {
  subjects: UserSubject[];
}

const SubjectBadges: React.FC<SubjectBadgesProps> = ({ subjects }) => {
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
    </div>
  );
};

export default SubjectBadges;
