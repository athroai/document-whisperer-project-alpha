
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Student } from '@/types/dashboard';
import { Card, CardContent } from '@/components/ui/card';

interface StudentTrendsProps {
  student: Student;
  classAveragesData: Array<{
    subject: string;
    confidence: number;
    score: number;
  }>;
  subjectComparisonData: Array<{
    subject: string;
    confidence: number;
    score: number;
  }>;
  isLoading?: boolean;
}

const StudentTrends = ({ 
  student, 
  classAveragesData, 
  subjectComparisonData,
  isLoading = false
}: StudentTrendsProps) => {
  // Transform the data to include both class average and student data in the same array
  const combinedData = classAveragesData.map(classItem => {
    // Find the matching student data
    const studentItem = subjectComparisonData.find(
      item => item.subject === classItem.subject
    );
    
    return {
      subject: classItem.subject,
      classAverage: classItem.confidence,
      studentConfidence: studentItem ? studentItem.confidence : 0
    };
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
            <div className="h-[250px] bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Confidence vs. Class Average</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={combinedData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="classAverage" 
              name="Class Average" 
              fill="#8884d8" 
            />
            <Bar 
              dataKey="studentConfidence" 
              name={`${student.name}'s Confidence`} 
              fill="#82ca9d" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudentTrends;
