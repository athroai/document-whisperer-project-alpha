
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskSubmissionHeatmap as TaskHeatmapType } from '@/types/insights';
import { addDays, format, startOfWeek, startOfMonth } from 'date-fns';

interface TaskSubmissionHeatmapProps {
  data: TaskHeatmapType[];
  loading: boolean;
}

const TaskSubmissionHeatmap: React.FC<TaskSubmissionHeatmapProps> = ({ data, loading }) => {
  // Generate the last 4 weeks of dates for the heatmap
  const generateCalendarDays = () => {
    const result = [];
    const today = new Date();
    const startDay = startOfWeek(startOfMonth(today)); // Start from beginning of the week of the month
    
    for (let i = 0; i < 28; i++) {
      const current = addDays(startDay, i);
      result.push({
        date: format(current, 'yyyy-MM-dd'),
        day: format(current, 'd'),
        dayName: format(current, 'EEE'),
        isToday: format(today, 'yyyy-MM-dd') === format(current, 'yyyy-MM-dd'),
        isCurrentMonth: today.getMonth() === current.getMonth(),
      });
    }
    return result;
  };
  
  const calendarDays = generateCalendarDays();
  
  // Get the count for a specific date
  const getCountForDate = (date: string) => {
    const submission = data.find(item => item.date === date);
    return submission ? submission.count : 0;
  };
  
  // Calculate heatmap intensity
  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    if (count < 3) return 'bg-green-100';
    if (count < 5) return 'bg-green-200';
    if (count < 8) return 'bg-green-300';
    if (count < 12) return 'bg-green-400';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Submissions</CardTitle>
          <CardDescription>Loading submission data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="grid grid-cols-7 gap-1">
              {Array(28).fill(0).map((_, index) => (
                <div key={index} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Submissions</CardTitle>
        <CardDescription>Calendar view of student submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-xs font-medium text-center">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const count = getCountForDate(day.date);
            return (
              <div
                key={day.date}
                className={`
                  relative h-12 rounded flex items-center justify-center
                  ${getIntensityClass(count)}
                  ${!day.isCurrentMonth ? 'opacity-50' : ''}
                  ${day.isToday ? 'ring-2 ring-primary' : ''}
                `}
                title={`${day.date}: ${count} submissions`}
              >
                <span className="text-xs font-medium">{day.day}</span>
                {count > 0 && (
                  <span className="absolute bottom-1 right-1 text-[10px] font-bold">
                    {count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center justify-end mt-4 gap-2">
          <div className="text-xs">Less</div>
          <div className="flex gap-0.5">
            <div className="w-4 h-4 bg-gray-100 rounded-sm"></div>
            <div className="w-4 h-4 bg-green-100 rounded-sm"></div>
            <div className="w-4 h-4 bg-green-200 rounded-sm"></div>
            <div className="w-4 h-4 bg-green-300 rounded-sm"></div>
            <div className="w-4 h-4 bg-green-400 rounded-sm"></div>
            <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
          </div>
          <div className="text-xs">More</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskSubmissionHeatmap;
