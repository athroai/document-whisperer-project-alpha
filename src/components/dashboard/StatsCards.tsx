
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, FileText } from 'lucide-react';

interface StatsCardsProps {
  studentCount: number;
  quizCount: number;
  isLoading?: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ 
  studentCount, 
  quizCount,
  isLoading = false
}) => {
  const cards = [
    {
      title: 'Total Students',
      value: studentCount,
      icon: <Users className="h-6 w-6" />,
      change: '+2 since last month',
      trend: 'up'
    },
    {
      title: 'Quizzes Completed',
      value: quizCount,
      icon: <FileText className="h-6 w-6" />,
      change: '+12 since last week',
      trend: 'up'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">{card.title}</span>
              <div className="rounded-full bg-gray-100 p-2">
                {card.icon}
              </div>
            </div>
            <div>
              {isLoading ? (
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <span className="text-3xl font-bold">{card.value}</span>
              )}
            </div>
            <div className={`text-sm mt-1 ${card.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {card.change}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
