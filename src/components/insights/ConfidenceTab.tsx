
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from 'recharts';
import { InsightsFilter, ConfidenceTrend, PerformanceTrend, SubjectPerformance } from '@/types/insights';
import insightsService from '@/services/insightsService';
import { TrendingUp, LineChart as LineChartIcon, BarChart3 } from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';

interface ConfidenceTabProps {
  teacherId: string;
  filter: InsightsFilter;
  loading: boolean;
}

const ConfidenceTab: React.FC<ConfidenceTabProps> = ({ teacherId, filter, loading }) => {
  const [confidenceTrends, setConfidenceTrends] = useState<ConfidenceTrend[]>([]);
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrend[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  useEffect(() => {
    const fetchConfidenceData = async () => {
      try {
        setLoadingData(true);
        const confidenceData = await insightsService.getConfidenceTrends(teacherId, filter);
        setConfidenceTrends(confidenceData);
        
        const performanceData = await insightsService.getPerformanceTrends(teacherId, filter);
        setPerformanceTrends(performanceData);
        
        const subjectData = await insightsService.getSubjectPerformance(teacherId, filter);
        setSubjectPerformance(subjectData);
        
        setLoadingData(false);
      } catch (error) {
        console.error("Failed to fetch confidence data:", error);
        setLoadingData(false);
      }
    };
    
    if (teacherId && !loading) {
      fetchConfidenceData();
    }
  }, [teacherId, filter, loading]);
  
  const isLoading = loading || loadingData;

  // Process the data for the line charts
  const processTimelineData = (data: (ConfidenceTrend | PerformanceTrend)[], dataKey: 'confidence' | 'performance'): any[] => {
    if (!data || data.length === 0) return [];
    
    // Ensure data is sorted by date
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Group by date
    const groupedByDate: Record<string, Record<string, number>> = {};
    sortedData.forEach(item => {
      if (!groupedByDate[item.date]) {
        groupedByDate[item.date] = {};
      }
      groupedByDate[item.date][item.subject] = item.value;
    });
    
    // Convert to array format for Recharts
    return Object.entries(groupedByDate).map(([date, subjects]) => {
      const dateObj = parseISO(date);
      return {
        date: format(dateObj, 'MMM dd'),
        ...subjects
      };
    });
  };
  
  // Create data for confidence timeline
  const confidenceTimelineData = processTimelineData(confidenceTrends, 'confidence');
  
  // Create data for performance timeline
  const performanceTimelineData = processTimelineData(performanceTrends, 'performance');
  
  // Get all subjects from the data
  const getUniqueSubjects = () => {
    const uniqueSubjects = new Set<string>();
    
    confidenceTrends.forEach(item => {
      uniqueSubjects.add(item.subject);
    });
    
    performanceTrends.forEach(item => {
      uniqueSubjects.add(item.subject);
    });
    
    return Array.from(uniqueSubjects);
  };
  
  const subjects = getUniqueSubjects();
  
  // Colors for the subjects
  const subjectColors: Record<string, string> = {
    'Maths': '#8884d8',
    'Science': '#82ca9d',
    'English': '#ffc658',
    'History': '#ff7300',
    'Geography': '#0088fe',
  };
  
  // Calculate correlation data between confidence and performance
  const correlationData = subjectPerformance.map(subject => ({
    name: subject.subject,
    confidence: subject.averageConfidence * 10, // Scale to percentage for comparison
    performance: subject.averageScore,
    color: subject.color
  }));

  return (
    <div className="space-y-6">
      {/* Confidence Timeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon size={20} />
            <span>Confidence Trends Over Time</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : confidenceTimelineData.length > 0 ? (
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={confidenceTimelineData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  {subjects.map((subject) => (
                    <Line
                      key={subject}
                      type="monotone"
                      dataKey={subject}
                      name={subject}
                      stroke={subjectColors[subject] || `#${Math.floor(Math.random()*16777215).toString(16)}`}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp size={40} className="mx-auto mb-2 opacity-30" />
              <p>No confidence trend data available</p>
              <p className="text-sm">Select a different time range or subject to view trends</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Performance Timeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon size={20} />
            <span>Performance Trends Over Time</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : performanceTimelineData.length > 0 ? (
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceTimelineData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {subjects.map((subject) => (
                    <Line
                      key={subject}
                      type="monotone"
                      dataKey={subject}
                      name={subject}
                      stroke={subjectColors[subject] || `#${Math.floor(Math.random()*16777215).toString(16)}`}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp size={40} className="mx-auto mb-2 opacity-30" />
              <p>No performance trend data available</p>
              <p className="text-sm">Select a different time range or subject to view trends</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Confidence vs Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 size={20} />
            <span>Confidence vs Performance Correlation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : correlationData.length > 0 ? (
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={correlationData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
                  barCategoryGap={30}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="performance" name="Performance (%)" radius={[4, 4, 0, 0]}>
                    {correlationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                  <Bar dataKey="confidence" name="Confidence (scaled to %)" radius={[4, 4, 0, 0]} fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 size={40} className="mx-auto mb-2 opacity-30" />
              <p>No correlation data available</p>
            </div>
          )}
          {!isLoading && correlationData.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              <p>This chart shows the relationship between student confidence levels (scaled to percentages) and their actual performance scores.</p>
              <p className="mt-1">Strong correlation indicates students have accurate self-assessment abilities.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfidenceTab;
