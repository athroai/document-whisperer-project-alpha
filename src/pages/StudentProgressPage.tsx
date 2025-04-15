
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import TeacherDashboardLayout from '@/components/dashboard/TeacherDashboardLayout';
import StudentDetail from '@/components/dashboard/StudentDetail';
import { Student } from '@/types/dashboard';

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
    subjects: ['Mathematics', 'Science', 'English'],
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

  if (!user || user.role !== 'teacher') {
    return <div className="p-8">Access Restricted: Teacher role required</div>;
  }

  return (
    <TeacherDashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Progress</h1>
        <p className="text-gray-500">View detailed performance data for this student</p>
        
        <StudentDetail student={mockStudent} />
      </div>
    </TeacherDashboardLayout>
  );
};

export default StudentProgressPage;
