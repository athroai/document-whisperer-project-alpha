
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Activity, Award, BookOpen, Users, Check, TrendingUp, BarChart3, LineChart, BookIcon
} from 'lucide-react';
import { InsightsFilter, InsightSummary, TopicPerformance } from '@/types/insights';
import insightsService from '@/services/insightsService';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  Line, 
  LineChart as RLineChart, 
  Bar, 
  BarChart as RBarChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface OverviewTabProps {
  teacherId: string;
  filter: InsightsFilter;
  loading: boolean;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ teacherId, filter, loading }) => {
  const [summary, setSummary] = useState<InsightSummary | null>(null);
  const [topTopics, setTopTopics] = useState<TopicPerformance[]>([]);
  const [bottomTopics, setBottomTopics] = useState<TopicPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummaryData = async () => {
      if (teacherId && !loading) {
        setIsLoading(true);
        try {
          // Fetch summary data
          const summaryData = await insightsService.getInsightsSummary(teacherId, filter);
          setSummary(summaryData);
          
          // Fetch topic performance for top/bottom topics table
          const topicsData = await insightsService.getTopicPerformance(teacherId, filter);
          
          // Sort topics by score
          const sortedTopics = [...topicsData].sort((a, b) => b.averageScore - a.averageScore);
          
          // Get top 5 and bottom 5 topics
          setTopTopics(sortedTopics.slice(0, 5));
          setBottomTopics(sortedTopics.slice(-5).reverse());
          
        } catch (error) {
          console.error("Failed to fetch overview data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchSummaryData();
  }, [teacherId, filter, loading]);

  // Stat cards to show key metrics
  const StatCard = ({ title, value, description, icon: Icon, color }: { 
    title: string; 
    value: string | number; 
    description?: string;
    icon: React.ElementType;
    color: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${color}`}>
          <Icon size={18} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? <Skeleton className="h-8 w-20" /> : value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Key Statistics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <StatCard 
          title="Quiz Average" 
          value={summary?.quizAverage || 0}
          description="Overall quiz score percentage"
          icon={Activity}
          color="bg-blue-100 text-blue-700"
        />
        <StatCard 
          title="Assignments Completed" 
          value={summary?.assignmentsCompleted || 0}
          description="Total across all classes"
          icon={Check}
          color="bg-green-100 text-green-700"
        />
        <StatCard 
          title="Students" 
          value={summary?.studentsCount || 0}
          description="Active learners"
          icon={Users}
          color="bg-purple-100 text-purple-700"
        />
        <StatCard 
          title="Confidence Average" 
          value={`${summary?.confidenceAverage || 0}/10`}
          description="Self-reported confidence"
          icon={TrendingUp}
          color="bg-amber-100 text-amber-700"
        />
      </div>

      {/* Topic Strength/Weakness Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {/* Weakest Topic */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Weakest Topic</CardTitle>
              <div className="p-2 rounded-full bg-red-100 text-red-700">
                <BarChart3 size={16} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-20" />
              </>
            ) : (
              <>
                <div className="text-xl font-semibold">{summary?.weakestTopic?.name}</div>
                <div className="text-sm text-muted-foreground">{summary?.weakestTopic?.subject}</div>
                <div className="text-sm mt-1">Average Score: <span className="font-medium text-red-600">{summary?.weakestTopic?.averageScore}%</span></div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Strongest Topic */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Strongest Topic</CardTitle>
              <div className="p-2 rounded-full bg-green-100 text-green-700">
                <Award size={16} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-20" />
              </>
            ) : (
              <>
                <div className="text-xl font-semibold">{summary?.strongestTopic?.name}</div>
                <div className="text-sm text-muted-foreground">{summary?.strongestTopic?.subject}</div>
                <div className="text-sm mt-1">Average Score: <span className="font-medium text-green-600">{summary?.strongestTopic?.averageScore}%</span></div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Topic Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Topics */}
            <div>
              <h4 className="mb-3 text-sm font-medium">Top Performing Topics</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? 
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                      </TableRow>
                    )) : 
                    topTopics.map(topic => (
                      <TableRow key={topic.id}>
                        <TableCell className="font-medium">{topic.topic}</TableCell>
                        <TableCell>{topic.subject}</TableCell>
                        <TableCell className="text-right">{topic.averageScore}%</TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </div>

            {/* Bottom Topics */}
            <div>
              <h4 className="mb-3 text-sm font-medium">Topics Needing Attention</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? 
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                      </TableRow>
                    )) : 
                    bottomTopics.map(topic => (
                      <TableRow key={topic.id}>
                        <TableCell className="font-medium">{topic.topic}</TableCell>
                        <TableCell>{topic.subject}</TableCell>
                        <TableCell className="text-right">{topic.averageScore}%</TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
