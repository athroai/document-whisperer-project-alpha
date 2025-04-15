
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import TeacherDashboardLayout from '@/components/dashboard/TeacherDashboardLayout';
import StudentDetail from '@/components/dashboard/StudentDetail';
import { Student, SubjectData } from '@/types/dashboard';

const StudentProgressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useAuth();
  const { user } = state;

  // Mock student data - in a real app, this would be fetched from an API
  const mockStudent: Student = {
    id: id || '1',
    name: 'Alex Johnson',
    email: 'alex.j@school.edu',
    year: 11,
    subjects: [
      { name: 'Mathematics', averageScore: 76, confidenceRating: 7, completedTopics: 12, totalTopics: 20 },
      { name: 'Science', averageScore: 82, confidenceRating: 8, completedTopics: 15, totalTopics: 25 },
      { name: 'English', averageScore: 71, confidenceRating: 6, completedTopics: 8, totalTopics: 15 }
    ] as SubjectData[],
    attendance: 92,
    totalQuizzesTaken: 24,
    averageScore: 76,
    lastActive: '2025-04-12T14:30:00Z',
    confidenceRatings: {
      Mathematics: 7,
      Science: 8,
      English: 6
    }
  };

  // Mock class averages data
  const classAveragesData = {
    Mathematics: 72,
    Science: 75,
    English: 68
  };
  
  // Mock quiz results data
  const quizResults = [
    { id: '1', title: 'Algebra Fundamentals', score: 85, date: '2025-04-10T10:30:00Z', subject: 'Mathematics' },
    { id: '2', title: 'Chemical Bonding', score: 92, date: '2025-04-08T14:15:00Z', subject: 'Science' },
    { id: '3', title: 'Shakespeare Analysis', score: 76, date: '2025-04-05T09:45:00Z', subject: 'English' }
  ];

  if (!user || user.role !== 'teacher') {
    return <div className="p-8">Access Restricted: Teacher role required</div>;
  }

  return (
    <TeacherDashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Progress</h1>
        <p className="text-gray-500">View detailed performance data for this student</p>
        
        <StudentDetail 
          student={mockStudent} 
          classAveragesData={classAveragesData}
          quizResults={quizResults}
        />
      </div>
    </TeacherDashboardLayout>
  );
};

export default StudentProgressPage;
