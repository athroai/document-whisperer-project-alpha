
import React from 'react';
import { AnalyticsFilter } from '@/types/analytics';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface AnalyticsFiltersProps {
  filter: AnalyticsFilter;
  onFilterChange: (filter: AnalyticsFilter) => void;
  subjects: string[];
  sets: string[];
  isLoading?: boolean;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  filter,
  onFilterChange,
  subjects,
  sets,
  isLoading = false
}) => {
  const dateRangeOptions = [
    { value: 'week', label: 'Past Week' },
    { value: 'month', label: 'Past Month' },
    { value: 'quarter', label: 'Past Quarter' },
    { value: 'year', label: 'Past Year' },
    { value: 'all', label: 'All Time' },
  ];

  const handleSubjectChange = (value: string) => {
    onFilterChange({
      ...filter,
      subject: value === 'all' ? null : value
    });
  };

  const handleSetChange = (value: string) => {
    onFilterChange({
      ...filter,
      set: value === 'all' ? null : value
    });
  };

  const handleDateRangeChange = (value: string) => {
    onFilterChange({
      ...filter,
      dateRange: value as AnalyticsFilter['dateRange']
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="subject-filter">Subject</Label>
            <Select
              disabled={isLoading}
              value={filter.subject || 'all'}
              onValueChange={handleSubjectChange}
            >
              <SelectTrigger id="subject-filter">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="set-filter">Set</Label>
            <Select
              disabled={isLoading}
              value={filter.set || 'all'}
              onValueChange={handleSetChange}
            >
              <SelectTrigger id="set-filter">
                <SelectValue placeholder="All Sets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sets</SelectItem>
                {sets.map((set) => (
                  <SelectItem key={set} value={set}>
                    {set}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-range-filter">Date Range</Label>
            <Select
              disabled={isLoading}
              value={filter.dateRange}
              onValueChange={handleDateRangeChange}
            >
              <SelectTrigger id="date-range-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsFilters;
