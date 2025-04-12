
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
}

const StudentTrends = ({ student, classAveragesData, subjectComparisonData }: StudentTrendsProps) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Confidence vs. Class Average</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={classAveragesData}
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
            <Bar dataKey="confidence" name="Class Average" fill="#8884d8" />
            
            {/* Render individual student bars */}
            {subjectComparisonData.map((entry, index) => (
              <Bar 
                key={`student-bar-${index}`}
                dataKey="confidence" 
                name={`${student.name}'s Confidence`} 
                data={[{ subject: entry.subject, confidence: entry.confidence }]}
                fill="#82ca9d" 
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudentTrends;
