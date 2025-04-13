
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InsightsFilter, InsightSummary } from '@/types/insights';
import { BarChart, LineChart, ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import insightsService from '@/services/insightsService';
import { toast } from '@/components/ui/use-toast';

interface OverviewTabProps {
  teacherId: string;
  filter: InsightsFilter;
  loading?: boolean;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ teacherId, filter, loading: parentLoading }) => {
  const [summary, setSummary] = useState<InsightSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [subjectPerformance, setSubjectPerformance] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!teacherId) return;
      
      setLoading(true);
      try {
        // Fetch summary data
        const summaryData = await insightsService.getInsightsSummary(teacherId, filter);
        setSummary(summaryData);
        
        // Fetch subject performance data
        const subjectData = await insightsService.getSubjectPerformance(teacherId, filter);
        
        // Transform data for visualization
        const transformedSubjectData = subjectData.map(subject => ({
          name: subject.subject,
          score: subject.averageScore,
          confidence: subject.averageConfidence,
          students: subject.studentsCount,
          fill: subject.color
        }));
        
        setSubjectPerformance(transformedSubjectData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch overview data:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch overview data. Please try again.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, [teacherId, filter]);

  // Function to render loading skeletons
  const renderSkeletons = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (loading || parentLoading) {
    return renderSkeletons();
  }

  return (
    <div className="space-y-6">
      {summary && (
        <>
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{summary.quizAverage}%</div>
                <p className="text-sm text-muted-foreground">Quiz Average</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{summary.confidenceAverage.toFixed(1)}/10</div>
                <p className="text-sm text-muted-foreground">Average Confidence</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{summary.studentsCount}</div>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{summary.assignmentsCompleted}</div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Subject Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>Average scores and confidence levels by subject</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" domain={[0, 10]} />
                    <YAxis yAxisId="right" orientation="right" stroke="#8884d8" domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="right" dataKey="score" name="Average Score %" fill="#8884d8" />
                    <Bar yAxisId="left" dataKey="confidence" name="Confidence (1-10)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Topic Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Strong Topics</CardTitle>
                <CardDescription>Areas where students excel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-md">
                    <h3 className="font-medium text-green-800">
                      {summary.strongestTopic?.name}
                    </h3>
                    <p className="text-sm text-green-600">
                      Subject: {summary.strongestTopic?.subject}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="bg-green-100 text-green-800 font-medium px-2 py-1 rounded text-sm">
                        {summary.strongestTopic?.averageScore}% average score
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Improvement Areas</CardTitle>
                <CardDescription>Topics needing additional attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-md">
                    <h3 className="font-medium text-red-800">
                      {summary.weakestTopic?.name}
                    </h3>
                    <p className="text-sm text-red-600">
                      Subject: {summary.weakestTopic?.subject}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="bg-red-100 text-red-800 font-medium px-2 py-1 rounded text-sm">
                        {summary.weakestTopic?.averageScore}% average score
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default OverviewTab;
