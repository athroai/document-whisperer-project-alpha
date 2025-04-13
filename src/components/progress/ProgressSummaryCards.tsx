
import React from 'react';
import { SubjectProgress } from '@/types/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, BarChart, CalendarDays } from 'lucide-react';

interface ProgressSummaryCardsProps {
  data: SubjectProgress;
}

const ProgressSummaryCards: React.FC<ProgressSummaryCardsProps> = ({ data }) => {
  // Function to determine the color based on score
  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Assignments Completed */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.assignmentsCompleted}</div>
          <p className="text-xs text-muted-foreground mt-1">Assignments completed</p>
        </CardContent>
      </Card>

      {/* Incomplete Assignments */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <XCircle className="mr-2 h-4 w-4 text-red-500" />
            Incomplete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.assignmentsIncomplete}</div>
          <p className="text-xs text-muted-foreground mt-1">Assignments pending</p>
        </CardContent>
      </Card>

      {/* Average Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <BarChart className="mr-2 h-4 w-4 text-blue-500" />
            Average Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getScoreColor(data.averageScore)}`}>
            {data.averageScore.toFixed(1)}
          </div>
          <Progress 
            value={data.averageScore} 
            className="h-2 mt-2"
            indicatorClassName={data.averageScore >= 85 ? 'bg-green-500' : data.averageScore >= 70 ? 'bg-amber-500' : 'bg-red-500'}
          />
        </CardContent>
      </Card>

      {/* Most Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <CalendarDays className="mr-2 h-4 w-4 text-purple-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium line-clamp-2">{data.recentActivity}</div>
          <p className="text-xs text-muted-foreground mt-1">Last activity recorded</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressSummaryCards;
