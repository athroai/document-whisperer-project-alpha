
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Award, Book, CheckCircle, LineChart, TrendingUp, UserCheck } from 'lucide-react';
import { InsightSummary } from '@/types/insights';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricsGridProps {
  data: InsightSummary | null;
  loading: boolean;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {Array(5).fill(0).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-6 w-12" />
              </div>
              <Skeleton className="h-5 w-24 mt-4" />
              <Skeleton className="h-4 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const metrics = [
    {
      title: "Confidence Score",
      value: `${data.confidenceAverage.toFixed(1)}/10`,
      description: "Average across all students",
      icon: TrendingUp,
      color: "text-blue-500 bg-blue-100"
    },
    {
      title: "Most Studied Subject",
      value: data.mostStudiedSubject?.name || "N/A",
      description: `${data.mostStudiedSubject?.count || 0} sessions`,
      icon: Book,
      color: "text-purple-500 bg-purple-100"
    },
    {
      title: "Most Active Student",
      value: data.mostActiveStudent?.name || "N/A",
      description: `${data.mostActiveStudent?.activityCount || 0} activities`,
      icon: UserCheck,
      color: "text-green-500 bg-green-100"
    },
    {
      title: "Tasks This Week",
      value: data.weeklyTasksCompleted.toString(),
      description: "Completed assignments",
      icon: CheckCircle,
      color: "text-amber-500 bg-amber-100"
    },
    {
      title: "Quiz Pass Rate",
      value: `${data.quizPassRate}%`,
      description: "Score >= 60%",
      icon: Award,
      color: "text-red-500 bg-red-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div className={`p-2 rounded-full ${metric.color}`}>
                <metric.icon className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold">{metric.value}</span>
            </div>
            <h3 className="text-sm font-medium mt-2">{metric.title}</h3>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetricsGrid;
