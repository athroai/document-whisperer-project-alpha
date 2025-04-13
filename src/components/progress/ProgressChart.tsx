
import React from 'react';
import { ScoreHistoryEntry } from '@/types/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProgressChartProps {
  data: ScoreHistoryEntry[];
  subject: string;
}

const chartConfig = {
  score: {
    label: 'Score',
    theme: {
      light: '#8B5CF6', // Purple from our palette
      dark: '#9b87f5',  // Slightly lighter purple for dark mode
    },
  },
};

const ProgressChart: React.FC<ProgressChartProps> = ({ data, subject }) => {
  // Format data for chart display
  const chartData = data.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short' 
    }),
    score: entry.score,
  }));

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>{subject} Progress Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tickCount={6} 
                  tick={{ fontSize: 12 }} 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="score" name="Score" fill="var(--color-score)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
