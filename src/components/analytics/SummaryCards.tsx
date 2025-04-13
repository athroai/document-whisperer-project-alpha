
import React from 'react';
import { AnalyticsSummary } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, BarChart, CheckCircle } from 'lucide-react';

interface SummaryCardsProps {
  summary: AnalyticsSummary;
  isLoading?: boolean;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, isLoading = false }) => {
  const cards = [
    {
      title: 'Total Students',
      value: summary.totalStudents,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Assignments Created',
      value: summary.totalAssignments,
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Avg. Completion Rate',
      value: `${summary.averageCompletionRate}%`,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Avg. Score',
      value: `${summary.averageScore}%`,
      icon: BarChart,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  card.value
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SummaryCards;
