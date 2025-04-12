
import React from 'react';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Pencil, BookOpen, Users, BarChart } from 'lucide-react';

interface StatsCardsProps {
  studentCount: number;
  quizCount?: number;
}

const StatsCards = ({ studentCount, quizCount = 0 }: StatsCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardContent className="flex flex-row items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Students</p>
            <p className="text-3xl font-bold">{studentCount}</p>
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Users className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex flex-row items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Quizzes</p>
            <p className="text-3xl font-bold">{quizCount}</p>
          </div>
          <div className="rounded-full bg-green-100 p-3">
            <BookOpen className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex flex-row items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Average Score</p>
            <p className="text-3xl font-bold">
              {quizCount > 0 ? '78%' : '-'}
            </p>
          </div>
          <div className="rounded-full bg-blue-100 p-3">
            <BarChart className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex flex-row items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Assignments</p>
            <p className="text-3xl font-bold">12</p>
          </div>
          <div className="rounded-full bg-amber-100 p-3">
            <Pencil className="h-8 w-8 text-amber-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
