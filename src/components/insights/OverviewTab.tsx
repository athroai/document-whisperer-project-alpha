
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { AlertTriangle, BookOpen, CheckCircle, Users, BookIcon, TrendingUp } from 'lucide-react';
import { InsightsFilter, InsightSummary, SubjectPerformance } from '@/types/insights';
import insightsService from '@/services/insightsService';

interface OverviewTabProps {
  teacherId: string;
  filter: InsightsFilter;
  loading: boolean;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ teacherId, filter, loading }) => {
  const [summary, setSummary] = useState<InsightSummary | null>(null);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoadingData(true);
        const summaryData = await insightsService.getInsightsSummary(teacherId, filter);
        setSummary(summaryData);
        
        const subjectData = await insightsService.getSubjectPerformance(teacherId, filter);
        setSubjectPerformance(subjectData);
        
        setLoadingData(false);
      } catch (error) {
        console.error("Failed to fetch summary data:", error);
        setLoadingData(false);
      }
    };
    
    if (teacherId && !loading) {
      fetchSummaryData();
    }
  }, [teacherId, filter, loading]);
  
  const isLoading = loading || loadingData;

  // Quick stats
  const stats = [
    { 
      title: "Students", 
      value: summary?.studentsCount || 0, 
      icon: Users, 
      color: "bg-blue-100 text-blue-700" 
    },
    { 
      title: "Avg. Score", 
      value: summary ? `${summary.quizAverage}%` : "0%", 
      icon: CheckCircle, 
      color: "bg-green-100 text-green-700" 
    },
    { 
      title: "Assignments", 
      value: summary?.assignmentsCompleted || 0, 
      icon: BookOpen, 
      color: "bg-purple-100 text-purple-700" 
    },
    { 
      title: "Avg. Confidence", 
      value: summary ? `${summary.confidenceAverage}/10` : "0/10", 
      icon: TrendingUp, 
      color: "bg-amber-100 text-amber-700" 
    }
  ];

  // Format subject data for charts
  const subjectData = subjectPerformance.map(subject => ({
    name: subject.subject,
    score: subject.averageScore,
    confidence: subject.averageConfidence * 10, // Scale to match percentage
    fill: subject.color
  }));

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  {isLoading ? (
                    <Skeleton className="h-9 w-16 mt-1" />
                  ) : (
                    <h4 className="text-3xl font-bold">{stat.value}</h4>
                  )}
                </div>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="w-full h-[300px] flex items-center justify-center">
                <Skeleton className="h-[250px] w-full" />
              </div>
            ) : (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={subjectData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" name="Average Score (%)" radius={[4, 4, 0, 0]}>
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                    <Bar dataKey="confidence" name="Confidence (scaled)" radius={[4, 4, 0, 0]} fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Topic Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Topic Insights</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Strongest Topic */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <TrendingUp className="h-5 w-5 text-green-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Strongest Topic</p>
                        <h4 className="text-xl font-semibold">
                          {summary?.strongestTopic.name || "Loading..."}
                        </h4>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{summary?.strongestTopic.subject || ""}</p>
                      <p className="text-lg font-bold text-green-600">
                        {summary ? `${summary.strongestTopic.averageScore}%` : ""}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Weakest Topic */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-red-100 p-2 rounded-full mr-3">
                        <AlertTriangle className="h-5 w-5 text-red-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Needs Attention</p>
                        <h4 className="text-xl font-semibold">
                          {summary?.weakestTopic.name || "Loading..."}
                        </h4>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{summary?.weakestTopic.subject || ""}</p>
                      <p className="text-lg font-bold text-amber-600">
                        {summary ? `${summary.weakestTopic.averageScore}%` : ""}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Topics Distribution */}
                <div className="pt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Topics by Performance</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">High (70%+)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                      <span className="text-sm">Medium (50-70%)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-sm">Low (&lt;50%)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;
