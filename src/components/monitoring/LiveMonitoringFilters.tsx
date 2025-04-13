
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LiveMonitoringFiltersProps {
  onSubjectFilterChange: (subject: string | null) => void;
  onActivityFilterChange: (activity: string | null) => void;
  onSortChange: (sortBy: string) => void;
}

const LiveMonitoringFilters: React.FC<LiveMonitoringFiltersProps> = ({
  onSubjectFilterChange,
  onActivityFilterChange,
  onSortChange,
}) => {
  return (
    <div className="flex space-x-2">
      {/* Subject Filter */}
      <Select onValueChange={(value) => onSubjectFilterChange(value === 'all' ? null : value)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Subject" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Subjects</SelectItem>
          <SelectItem value="Mathematics">Mathematics</SelectItem>
          <SelectItem value="English">English</SelectItem>
          <SelectItem value="Science">Science</SelectItem>
          <SelectItem value="History">History</SelectItem>
        </SelectContent>
      </Select>

      {/* Activity Filter */}
      <Select onValueChange={(value) => onActivityFilterChange(value === 'all' ? null : value)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Activity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Activities</SelectItem>
          <SelectItem value="Quiz">Quiz</SelectItem>
          <SelectItem value="Study Session">Study Session</SelectItem>
          <SelectItem value="AthroChat">AthroChat</SelectItem>
          <SelectItem value="Practice">Practice</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort By */}
      <Select onValueChange={onSortChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="lastName">Name</SelectItem>
          <SelectItem value="confidence">Confidence</SelectItem>
          <SelectItem value="activity">Activity Type</SelectItem>
          <SelectItem value="engagement">Engagement</SelectItem>
          <SelectItem value="sessionTime">Session Time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LiveMonitoringFilters;
