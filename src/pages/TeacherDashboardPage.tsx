
import React, { useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import StudentsList from '@/components/dashboard/StudentsList';
import StudentDetail from '@/components/dashboard/StudentDetail';
import { calculateClassAverages } from '@/utils/dashboardUtils';

// Mock data
const mockStudents = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@school.edu',
    confidenceTrend: [
      { date: '2025-03-01', confidence: 6 },
      { date: '2025-03-08', confidence: 7 },
      { date: '2025-03-15', confidence: 6 },
      { date: '2025-03-22', confidence: 8 },
      { date: '2025-04-01', confidence: 9 },
    ],
    lastStudy: '2025-04-10',
    lastQuiz: {
      date: '2025-04-08',
      score: 85,
      subject: 'Mathematics'
    },
    subjects: {
      maths: { confidence: 8, averageScore: 85, sessionsThisWeek: 3 },
      science: { confidence: 7, averageScore: 78, sessionsThisWeek: 1 },
      english: { confidence: 9, averageScore: 92, sessionsThisWeek: 2 },
      history: { confidence: 6, averageScore: 74, sessionsThisWeek: 0 }
    }
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.c@school.edu',
    confidenceTrend: [
      { date: '2025-03-01', confidence: 4 },
      { date: '2025-03-08', confidence: 5 },
      { date: '2025-03-15', confidence: 6 },
      { date: '2025-03-22', confidence: 7 },
      { date: '2025-04-01', confidence: 8 },
    ],
    lastStudy: '2025-04-11',
    lastQuiz: {
      date: '2025-04-09',
      score: 78,
      subject: 'Science'
    },
    subjects: {
      maths: { confidence: 9, averageScore: 90, sessionsThisWeek: 2 },
      science: { confidence: 8, averageScore: 80, sessionsThisWeek: 3 },
      english: { confidence: 6, averageScore: 72, sessionsThisWeek: 1 },
      history: { confidence: 5, averageScore: 65, sessionsThisWeek: 0 }
    }
  },
  {
    id: '3',
    name: 'Emma Williams',
    email: 'emma.w@school.edu',
    confidenceTrend: [
      { date: '2025-03-01', confidence: 8 },
      { date: '2025-03-08', confidence: 7 },
      { date: '2025-03-15', confidence: 9 },
      { date: '2025-03-22', confidence: 8 },
      { date: '2025-04-01', confidence: 9 },
    ],
    lastStudy: '2025-04-09',
    lastQuiz: {
      date: '2025-04-07',
      score: 92,
      subject: 'English'
    },
    subjects: {
      maths: { confidence: 7, averageScore: 75, sessionsThisWeek: 1 },
      science: { confidence: 6, averageScore: 70, sessionsThisWeek: 0 },
      english: { confidence: 9, averageScore: 95, sessionsThisWeek: 3 },
      history: { confidence: 8, averageScore: 88, sessionsThisWeek: 2 }
    }
  },
];

const TeacherDashboardPage = () => {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [markingStyle, setMarkingStyle] = useState('detailed');
  
  // Find the selected student from the students list
  const student = selectedStudent 
    ? mockStudents.find(s => s.id === selectedStudent) 
    : null;
    
  // Calculate class averages for the trends tab
  const classAveragesData = calculateClassAverages(mockStudents);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <DashboardHeader 
        markingStyle={markingStyle} 
        setMarkingStyle={setMarkingStyle} 
      />

      {/* Stats Cards */}
      <StatsCards studentCount={mockStudents.length} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <StudentsList 
          students={mockStudents} 
          selectedStudent={selectedStudent} 
          setSelectedStudent={setSelectedStudent} 
        />

        {/* Student Detail */}
        <StudentDetail 
          student={student} 
          classAveragesData={classAveragesData} 
        />
      </div>
    </div>
  );
};

export default TeacherDashboardPage;
