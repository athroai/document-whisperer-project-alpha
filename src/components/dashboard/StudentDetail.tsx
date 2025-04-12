
import React from 'react';
import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Student, SubjectData } from '@/types/dashboard';
import StudentOverview from './StudentDetail/StudentOverview';
import StudentSubjects from './StudentDetail/StudentSubjects';
import StudentTrends from './StudentDetail/StudentTrends';

interface StudentDetailProps {
  student: Student | null;
  classAveragesData: Array<{
    subject: string;
    confidence: number;
    score: number;
  }>;
}

const StudentDetail = ({ student, classAveragesData }: StudentDetailProps) => {
  if (!student) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Select a student to view details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Select a student from the list to view their details
          </div>
        </CardContent>
      </Card>
    );
  }

  // Convert student subjects for the subjects tab
  const subjectComparisonData = [
    { subject: 'Maths', confidence: student.subjects.maths.confidence, score: student.subjects.maths.averageScore },
    { subject: 'Science', confidence: student.subjects.science.confidence, score: student.subjects.science.averageScore },
    { subject: 'English', confidence: student.subjects.english.confidence, score: student.subjects.english.averageScore },
    { subject: 'History', confidence: student.subjects.history.confidence, score: student.subjects.history.averageScore },
  ];

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{`${student.name}'s Performance`}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <StudentOverview student={student} />
          </TabsContent>
          
          <TabsContent value="subjects">
            <StudentSubjects student={student} subjectComparisonData={subjectComparisonData} />
          </TabsContent>
          
          <TabsContent value="trends">
            <StudentTrends student={student} classAveragesData={classAveragesData} subjectComparisonData={subjectComparisonData} />
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium">Actions</h3>
          <div className="flex gap-2 mt-2">
            <Button size="sm">
              <BookOpen size={16} className="mr-1" />
              View Progress
            </Button>
            <Button size="sm" variant="outline">
              Send Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentDetail;
