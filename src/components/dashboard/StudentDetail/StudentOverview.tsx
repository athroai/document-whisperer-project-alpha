
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Student } from '@/types/dashboard';

interface StudentOverviewProps {
  student: Student;
}

const StudentOverview = ({ student }: StudentOverviewProps) => {
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
