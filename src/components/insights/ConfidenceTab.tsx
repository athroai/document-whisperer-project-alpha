
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { InsightsFilter, ConfidenceTrend, SubjectPerformance } from '@/types/insights';
import insightsService from '@/services/insightsService';
import { Skeleton } from '@/components/ui/skeleton';

interface ConfidenceTabProps {
  teacherId: string;
  filter: InsightsFilter;
  loading: boolean;
}

const ConfidenceTab: React.FC<ConfidenceTabProps> = ({ teacherId, filter, loading }) => {
  const [confidenceTrends, setConfidenceTrends] = useState<ConfidenceTrend[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConfidenceData = async () => {
      if (teacherId && !loading) {
        setIsLoading(true);
        try {
          // Fetch confidence trends data
          const trendsData = await insightsService.getConfidenceTrends(teacherId, filter);
          setConfidenceTrends(trendsData);
          
          // Fetch subject performance data for colors and reference
          const subjectsData = await insightsService.getSubjectPerformance(teacherId, filter);
          setSubjectPerformance(subjectsData);
          
        } catch (error) {
          console.error("Failed to fetch confidence data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchConfidenceData();
  }, [teacherId, filter, loading]);

  // Process confidence trend data for the chart
  const processConfidenceTrends = () => {
    // Group by date for plotting
    const groupedByDate = confidenceTrends.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = { date: item.date };
      }
      acc[item.date][item.subject] = item.value;
      return acc;
    }, {} as Record<string, any>);
    
    // Convert to array and sort by date
    return Object.values(groupedByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const chartConfig = Object.fromEntries(
    subjectPerformance.map(subject => [
      subject.subject, 
      { color: subject.color }
    ])
  );

  return (
    <div className="space-y-6">
      {/* Confidence Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Confidence Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="w-full aspect-[3/2] bg-muted/10 flex items-center justify-center rounded-lg">
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : (
            <ChartContainer className="h-[350px]" config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processConfidenceTrends()}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                  />
                  <YAxis domain={[0, 10]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  {subjectPerformance.map((subject) => (
                    <Line
                      key={subject.subject}
                      type="monotone"
                      dataKey={subject.subject}
                      name={subject.subject}
                      stroke={subject.color}
                      strokeWidth={2}
                      dot={true}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Confidence Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will show detailed confidence analytics once more data is available.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfidenceTab;
