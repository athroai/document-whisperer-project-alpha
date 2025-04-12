
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Student } from '@/types/dashboard';

interface StudentSubjectsProps {
  student: Student;
  subjectComparisonData: Array<{
    subject: string;
    confidence: number;
    score: number;
  }>;
  isLoading?: boolean;
}

const getSubjectColor = (subject: string) => {
  switch (subject.toLowerCase()) {
    case 'maths': return '#8884d8';
    case 'science': return '#82ca9d';
    case 'english': return '#ffc658';
    case 'history': return '#ff8042';
    default: return '#8884d8';
  }
};

const StudentSubjects = ({ student, subjectComparisonData, isLoading = false }: StudentSubjectsProps) => {
  if (isLoading) {
    return (
      <div>
        <h3 className="text-lg font-medium mb-4">Subject Performance</h3>
        <div className="h-[250px] w-full animate-pulse bg-gray-200 rounded"></div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="py-3">
                <div className="h-5 bg-gray-200 rounded w-20"></div>
              </CardHeader>
              <CardContent className="py-0">
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded col-span-2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Subject Performance</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={subjectComparisonData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" domain={[0, 10]} />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="confidence" name="Confidence (0-10)" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="score" name="Average Score (%)" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(student.subjects).map(([subject, data]) => (
          <Card key={subject} className={`border-l-4`} style={{ borderLeftColor: getSubjectColor(subject) }}>
            <CardHeader className="py-3">
              <CardTitle className="text-sm capitalize">{subject}</CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Confidence</p>
                  <p className="font-bold">{data.confidence}/10</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sessions</p>
                  <p className="font-bold">{data.sessionsThisWeek} this week</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Average Score</p>
                  <p className="font-bold">{data.averageScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentSubjects;
