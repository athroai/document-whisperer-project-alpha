
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface SubmissionData {
  date: string;
  submitted: number;
}

interface SubmissionTrendChartProps {
  data: SubmissionData[];
  title?: string;
  isLoading?: boolean;
}

const chartConfig = {
  submissions: {
    label: 'Submissions',
    theme: {
      light: '#3B82F6',
      dark: '#60A5FA',
    },
  },
};

const SubmissionTrendChart: React.FC<SubmissionTrendChartProps> = ({ 
  data, 
  title = "Submission Trends Over Time",
  isLoading = false
}) => {
  // Format dates for display
  const formattedData = data.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    })
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <div className="h-full w-full flex items-center justify-center bg-gray-50 animate-pulse">
            Loading trend data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <div className="h-full w-full flex items-center justify-center bg-gray-50">
            No submission data available for the selected filters.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd" // Show first and last dates at minimum
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="submitted"
                name="submissions"
                stroke="var(--color-submissions)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SubmissionTrendChart;
