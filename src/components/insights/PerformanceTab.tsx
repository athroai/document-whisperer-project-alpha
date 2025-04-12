
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { InsightsFilter, StudentPerformance, ClassHeatmapData } from '@/types/insights';
import insightsService from '@/services/insightsService';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart3, Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PerformanceTabProps {
  teacherId: string;
  filter: InsightsFilter;
  loading: boolean;
}

const PerformanceTab: React.FC<PerformanceTabProps> = ({ teacherId, filter, loading }) => {
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance[]>([]);
  const [heatmapData, setHeatmapData] = useState<ClassHeatmapData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoadingData(true);
        if (filter.classId !== 'all') {
          const performanceData = await insightsService.getStudentPerformance(teacherId, filter.classId);
          setStudentPerformance(performanceData);
          
          const heatmapData = await insightsService.getClassHeatmapData(teacherId, filter.classId);
          setHeatmapData(heatmapData);
        } else {
          // Get data for first class as a fallback when "all" is selected
          const classes = await insightsService.getTeacherClasses(teacherId);
          if (classes.length > 0) {
            const performanceData = await insightsService.getStudentPerformance(teacherId, classes[0].id);
            setStudentPerformance(performanceData);
            
            const heatmapData = await insightsService.getClassHeatmapData(teacherId, classes[0].id);
            setHeatmapData(heatmapData);
          }
        }
        setLoadingData(false);
      } catch (error) {
        console.error("Failed to fetch performance data:", error);
        setLoadingData(false);
      }
    };
    
    if (teacherId && !loading) {
      fetchPerformanceData();
    }
  }, [teacherId, filter, loading]);
  
  const isLoading = loading || loadingData;
  
  // Get all subjects from the heatmap data
  const subjects = heatmapData.length > 0
    ? Object.keys(heatmapData[0].subjects)
    : [];

  // Format student performance data for charts
  const studentData = studentPerformance
    .slice(0, 10) // Limit to top 10 students for readability
    .map(student => ({
      name: student.name.split(' ')[0], // Just use first name for chart labels
      performance: student.averageScore,
      confidence: student.averageConfidence * 10, // Scale to match percentage
    }));
  
  // Helper function to get color for score cells
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 65) return 'bg-blue-100 text-blue-800';
    if (score >= 50) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Student Performance Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 size={20} />
            <span>Student Performance Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : studentData.length > 0 ? (
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={studentData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
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
                  <Bar dataKey="performance" name="Score (%)" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="confidence" name="Confidence (scaled)" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users size={40} className="mx-auto mb-2 opacity-30" />
              <p>No student performance data available</p>
              <p className="text-sm">Select a class to view student performance</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Class Heatmap / Performance Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Class Performance Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : heatmapData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Student</TableHead>
                    {subjects.map(subject => (
                      <TableHead key={subject} className="text-center">
                        {subject.charAt(0).toUpperCase() + subject.slice(1)}
                      </TableHead>
                    ))}
                    <TableHead className="text-center">Average</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {heatmapData.map((student) => {
                    // Calculate average score across subjects
                    const scores = Object.values(student.subjects);
                    const average = scores.length 
                      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
                      : 0;
                      
                    return (
                      <TableRow key={student.studentId}>
                        <TableCell className="font-medium">{student.studentName}</TableCell>
                        {subjects.map(subject => {
                          const score = student.subjects[subject] || 0;
                          const colorClass = getScoreColor(score);
                          
                          return (
                            <TableCell key={subject} className="text-center">
                              <span className={`inline-block w-12 py-1 px-2 rounded text-xs font-medium ${colorClass}`}>
                                {score}%
                              </span>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center font-semibold">
                          <span className={`inline-block w-12 py-1 px-2 rounded text-xs font-medium ${getScoreColor(average)}`}>
                            {average}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users size={40} className="mx-auto mb-2 opacity-30" />
              <p>No heatmap data available</p>
              <p className="text-sm">Select a class to view the performance heatmap</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Performance Thresholds Legend */}
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-800 mr-2"></div>
          <span className="text-sm">Excellent (80%+)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-blue-100 border border-blue-800 mr-2"></div>
          <span className="text-sm">Good (65-79%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-amber-100 border border-amber-800 mr-2"></div>
          <span className="text-sm">Satisfactory (50-64%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-red-100 border border-red-800 mr-2"></div>
          <span className="text-sm">Needs Improvement (< 50%)</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTab;
