
import React from 'react';
import { QuizResult } from '@/types/quiz';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface StudentQuizzesProps {
  quizResults: QuizResult[];
}

const StudentQuizzes: React.FC<StudentQuizzesProps> = ({ quizResults }) => {
  // Calculate average scores by subject
  const subjectScores: Record<string, { total: number, count: number, scores: number[] }> = {};
  
  quizResults.forEach(result => {
    const subject = result.subject.toLowerCase();
    const scorePercent = (result.score / result.questionsAsked.length) * 100;
    
    if (!subjectScores[subject]) {
      subjectScores[subject] = { total: 0, count: 0, scores: [] };
    }
    
    subjectScores[subject].total += scorePercent;
    subjectScores[subject].count += 1;
    subjectScores[subject].scores.push(scorePercent);
  });
  
  const averageScores = Object.entries(subjectScores).map(([subject, data]) => ({
    subject: subject.charAt(0).toUpperCase() + subject.slice(1),
    averageScore: Math.round(data.total / data.count),
    quizCount: data.count
  }));
  
  // Format data for confidence trend chart
  const confidenceData = quizResults
    .map(result => ({
      date: new Date(result.timestamp).toLocaleDateString(),
      subject: result.subject.charAt(0).toUpperCase() + result.subject.slice(1),
      before: result.confidenceBefore,
      after: result.confidenceAfter,
      score: Math.round((result.score / result.questionsAsked.length) * 100)
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return (
    <div className="space-y-6">
      {quizResults.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No quiz results available for this student.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div>
            <h3 className="text-lg font-medium mb-4">Quiz Performance by Subject</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {averageScores.map((subject, i) => (
                <div key={i} className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{subject.subject}</span>
                    <span className="text-sm text-gray-500">{subject.quizCount} quizzes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={subject.averageScore} className="h-2" />
                    <span className="text-sm font-medium">{subject.averageScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Confidence Trend</h3>
            <div className="bg-white p-4 rounded-lg border shadow-sm" style={{ height: "300px" }}>
              {confidenceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={confidenceData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="before" 
                      name="Confidence Before" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="after" 
                      name="Confidence After" 
                      stroke="#82ca9d" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Not enough data to show confidence trend.</p>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Recent Quiz History</h3>
            <div className="bg-white rounded-lg border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Confidence Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizResults
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 5)
                    .map((result, index) => {
                      const scorePercent = Math.round((result.score / result.questionsAsked.length) * 100);
                      const confidenceChange = result.confidenceAfter - result.confidenceBefore;
                      const quizDate = new Date(result.timestamp);
                      
                      return (
                        <TableRow key={index}>
                          <TableCell>{quizDate.toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium capitalize">{result.subject}</TableCell>
                          <TableCell>{scorePercent}%</TableCell>
                          <TableCell className="text-right">
                            <span className={confidenceChange > 0 
                              ? 'text-green-600' 
                              : confidenceChange < 0 
                                ? 'text-red-600' 
                                : 'text-gray-500'
                            }>
                              {confidenceChange > 0 ? '+' : ''}{confidenceChange}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentQuizzes;
