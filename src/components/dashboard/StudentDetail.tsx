
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuizResult } from '@/types/quiz';
import { Student, SubjectData } from '@/types/dashboard';

import StudentOverview from './StudentDetail/StudentOverview';
import StudentSubjects from './StudentDetail/StudentSubjects';
import StudentTrends from './StudentDetail/StudentTrends';
import StudentQuizzes from './StudentDetail/StudentQuizzes';

interface StudentDetailProps {
  student: Student | null;
  classAveragesData: Array<{
    subject: string;
    confidence: number;
    score: number;
  }>;
  quizResults: QuizResult[];
  isLoading?: boolean;
}

const StudentDetail: React.FC<StudentDetailProps> = ({ 
  student, 
  classAveragesData,
  quizResults,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!student) {
    return (
      <div className="lg:col-span-2">
        <Card className="h-full min-h-[75vh] flex items-center justify-center">
          <CardContent>
            <p className="text-muted-foreground">
              Select a student to view details
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get student's subject data for comparison with class average
  const subjectComparisonData = Object.entries(student.subjects || {}).map(([subject, data]) => {
    // Use type assertion since we know the structure of the data
    const subjectData = data as SubjectData;
    return {
      subject: subject.charAt(0).toUpperCase() + subject.slice(1),
      confidence: subjectData.confidence || 0,
      score: subjectData.averageScore || 0
    };
  });

  return (
    <div className="lg:col-span-2">
      <Card className="h-full min-h-[75vh]">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">{student.name}</h2>
              <p className="text-muted-foreground">{student.email}</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <StudentOverview student={student} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="subjects">
              <StudentSubjects 
                student={student} 
                subjectComparisonData={subjectComparisonData}
                isLoading={isLoading}
              />
            </TabsContent>
            <TabsContent value="trends">
              <StudentTrends 
                student={student} 
                classAveragesData={classAveragesData} 
                subjectComparisonData={subjectComparisonData}
                isLoading={isLoading}
              />
            </TabsContent>
            <TabsContent value="quizzes">
              <StudentQuizzes quizResults={quizResults} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDetail;
