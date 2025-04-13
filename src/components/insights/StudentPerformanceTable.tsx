
import React, { useState } from 'react';
import { StudentPerformance } from '@/types/insights';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface StudentPerformanceTableProps {
  students: StudentPerformance[];
  loading: boolean;
}

type SortField = 'name' | 'averageScore' | 'averageConfidence' | 'tasksSubmitted';
type SortDirection = 'asc' | 'desc';

const StudentPerformanceTable: React.FC<StudentPerformanceTableProps> = ({ students, loading }) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('averageScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'averageScore':
        comparison = a.averageScore - b.averageScore;
        break;
      case 'averageConfidence':
        comparison = a.averageConfidence - b.averageConfidence;
        break;
      case 'tasksSubmitted':
        comparison = a.tasksSubmitted - b.tasksSubmitted;
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const truncateText = (text: string, maxLength = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getConfidenceTrend = (student: StudentPerformance) => {
    if (!student.confidenceTrend || student.confidenceTrend.length < 2) {
      return <Minus className="text-gray-400" />;
    }

    const recentValues = student.confidenceTrend.slice(-2);
    const difference = recentValues[1].value - recentValues[0].value;
    
    if (difference > 0.5) {
      return <ArrowUpRight className="text-green-500" />;
    } else if (difference < -0.5) {
      return <ArrowDownRight className="text-red-500" />;
    } else {
      return <Minus className="text-gray-400" />;
    }
  };

  const handleRowClick = (studentId: string) => {
    navigate(`/teacher/profiles?student=${studentId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Performance</CardTitle>
          <CardDescription>Loading student performance data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Avg. Quiz Score</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Tasks Submitted</TableHead>
                  <TableHead>AI Feedback Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array(5).fill(0).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[200px]" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Performance</CardTitle>
        <CardDescription>Overview of student performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Student {renderSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('averageScore')}
                >
                  <div className="flex items-center">
                    Avg. Quiz Score {renderSortIcon('averageScore')}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Confidence Trend
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('tasksSubmitted')}
                >
                  <div className="flex items-center">
                    Tasks Submitted {renderSortIcon('tasksSubmitted')}
                  </div>
                </TableHead>
                <TableHead>AI Feedback Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStudents.map(student => (
                <TableRow 
                  key={student.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(student.id)}
                >
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`
                        ${student.averageScore >= 80 ? 'text-green-600' : ''}
                        ${student.averageScore >= 60 && student.averageScore < 80 ? 'text-amber-600' : ''}
                        ${student.averageScore < 60 ? 'text-red-600' : ''}
                      `}>
                        {student.averageScore}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{student.averageConfidence}/10</span>
                      {getConfidenceTrend(student)}
                    </div>
                  </TableCell>
                  <TableCell>{student.tasksSubmitted}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {truncateText(student.aiFeedbackSummary || "No feedback available")}
                  </TableCell>
                </TableRow>
              ))}
              {sortedStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No student data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentPerformanceTable;
