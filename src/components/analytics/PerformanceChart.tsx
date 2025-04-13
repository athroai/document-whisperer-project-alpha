
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface PerformanceData {
  name: string;
  avgScore: number;
  completionRate: number;
  students?: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  title: string;
  isLoading?: boolean;
}

const chartConfig = {
  avgScore: {
    label: 'Average Score',
    theme: {
      light: '#8B5CF6',
      dark: '#A78BFA',
    },
  },
  completionRate: {
    label: 'Completion Rate',
    theme: {
      light: '#10B981',
      dark: '#34D399',
    },
  },
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, title, isLoading = false }) => {
  if (isLoading) {
    return (
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <div className="h-full w-full flex items-center justify-center bg-gray-50 animate-pulse">
            Loading chart data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <div className="h-full w-full flex items-center justify-center bg-gray-50">
            No data available for the selected filters.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                yAxisId="left"
                domain={[0, 100]} 
                tickCount={6} 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                label={{ value: '%', angle: -90, position: 'insideLeft', offset: -5 }}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="avgScore" 
                name="avgScore" 
                fill="var(--color-avgScore)" 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                yAxisId="left"
                dataKey="completionRate" 
                name="completionRate" 
                fill="var(--color-completionRate)" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
