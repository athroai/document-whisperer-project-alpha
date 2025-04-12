import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface StudentOverviewProps {
  student: any;
  isLoading?: boolean;
}

const StudentOverview: React.FC<StudentOverviewProps> = ({ 
  student,
  isLoading = false
}) => {
  // Only keep the last 5 entries for display
  const confidenceData = student.confidenceTrend || [];
  
  // Calculate average confidence
  const averageConfidence = confidenceData.length > 0
    ? Math.round(
        confidenceData.reduce((sum: number, entry: any) => sum + entry.confidence, 0) / 
        confidenceData.length
      )
    : 0;
  
  // Get subjects
  const subjects = Object.entries(student.subjects || {}).map(([key, value]: [string, any]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    confidence: value.confidence,
    average: value.averageScore
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-4 rounded-lg border shadow-sm animate-pulse">
              <div className="h-5 bg-gray-200 rounded mb-2 w-1/2"></div>
              <div className="h-7 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
          <div className="h-[250px] bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h3 className="text-lg font-medium">Contact Information</h3>
        <p className="text-sm text-muted-foreground mb-2">{student.email}</p>
        
        <h3 className="text-lg font-medium mt-4">Last Study Session</h3>
        <p className="text-sm text-muted-foreground">{student.lastStudy}</p>
        
        <h3 className="text-lg font-medium mt-4">Last Quiz</h3>
        <div className="text-sm text-muted-foreground">
          <p>Date: {student.lastQuiz.date}</p>
          <p>Subject: {student.lastQuiz.subject}</p>
          <p>Score: {student.lastQuiz.score}%</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium">Confidence Trend</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={student.confidenceTrend}
              margin={{
                top: 5,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              />
              <YAxis 
                domain={[0, 10]} 
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [`Confidence: ${value}`, 'Score']}
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              />
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;
