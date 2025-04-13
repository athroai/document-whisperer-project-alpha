
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { InsightsFilter, PerformanceTrend, SubjectPerformance, StudentPerformance } from '@/types/insights';
import insightsService from '@/services/insightsService';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from 'lucide-react';

interface PerformanceTabProps {
  teacherId: string;
  filter: InsightsFilter;
  loading: boolean;
}

const PerformanceTab: React.FC<PerformanceTabProps> = ({ teacherId, filter, loading }) => {
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrend[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupByStudent, setGroupByStudent] = useState(false);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (teacherId && !loading) {
        setIsLoading(true);
        try {
          // Fetch performance trends data
          const trendsData = await insightsService.getPerformanceTrends(teacherId, filter);
          setPerformanceTrends(trendsData);
          
          // Fetch subject performance data
          const subjectsData = await insightsService.getSubjectPerformance(teacherId, filter);
          setSubjectPerformance(subjectsData);
          
          // Fetch student performance data - pass the entire filter object instead of just classId
          const studentsData = await insightsService.getStudentPerformance(teacherId, filter);
          setStudentPerformance(studentsData);
          
        } catch (error) {
          console.error("Failed to fetch performance data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchPerformanceData();
  }, [teacherId, filter, loading]);

  // Process performance trend data for the chart
  const processPerformanceTrends = () => {
    // Group by date for plotting
    const groupedByDate = performanceTrends.reduce((acc, item) => {
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

  // Handle export button click
  const handleExportData = async (format: 'csv' | 'pdf') => {
    try {
      let url;
      if (format === 'csv') {
        url = await insightsService.exportToCsv(teacherId, filter, 'performance');
      } else {
        url = await insightsService.exportToPdf(teacherId, filter, 'performance');
      }
      
      // Create temporary anchor to trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-data-${filter.classId}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Failed to export ${format}:`, error);
    }
  };

  const chartConfig = Object.fromEntries(
    subjectPerformance.map(subject => [
      subject.subject, 
      { color: subject.color }
    ])
  );

  return (
    <div className="space-y-6">
      {/* Performance Trends Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Performance Trends</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setGroupByStudent(!groupByStudent)}
            >
              {groupByStudent ? 'Show Class Average' : 'Group by Student'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExportData('csv')}
            >
              <Download className="mr-1 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="w-full aspect-[3/2] bg-muted/10 flex items-center justify-center rounded-lg">
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : (
            <ChartContainer className="h-[350px]" config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processPerformanceTrends()}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                  />
                  <YAxis domain={[0, 100]} />
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

      {/* Subject Performance Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="w-full aspect-[3/2] bg-muted/10 flex items-center justify-center rounded-lg">
              <Skeleton className="h-[250px] w-full" />
            </div>
          ) : (
            <ChartContainer className="h-[300px]" config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar 
                    dataKey="averageScore" 
                    name="Score" 
                    fill="#4f46e5" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="averageConfidence" 
                    name="Confidence" 
                    fill="#06b6d4"
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Student Performance Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Student Performance</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExportData('pdf')}
          >
            <Download className="mr-1 h-4 w-4" />
            Export PDF
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Average Score</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? 
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  </TableRow>
                )) : 
                studentPerformance.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.averageScore}%</TableCell>
                    <TableCell>{student.averageConfidence}/10</TableCell>
                    <TableCell>{student.completionRate}%</TableCell>
                    <TableCell>{new Date(student.lastActive).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceTab;
