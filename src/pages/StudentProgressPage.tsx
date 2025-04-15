
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import TeacherDashboardLayout from '@/components/dashboard/TeacherDashboardLayout';
import StudentDetail from '@/components/dashboard/StudentDetail';
import { Student, SubjectData } from '@/types/dashboard';
import { QuizResult } from '@/types/quiz';

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
    subjects: {
      Mathematics: {
        confidence: 7,
        averageScore: 76,
        sessionsThisWeek: 3
      },
      Science: {
        confidence: 8,
        averageScore: 82,
        sessionsThisWeek: 4
      },
      English: {
        confidence: 6,
        averageScore: 71,
        sessionsThisWeek: 2
      }
    },
    confidenceTrend: [
      { date: '2025-03-15', confidence: 5 },
      { date: '2025-03-22', confidence: 6 },
      { date: '2025-03-29', confidence: 6 },
      { date: '2025-04-05', confidence: 7 },
      { date: '2025-04-12', confidence: 7 }
    ],
    lastStudy: '2025-04-12',
    lastQuiz: {
      date: '2025-04-10',
      score: 85,
      subject: 'Mathematics'
    }
  };

  // Mock class averages data
  const classAveragesData = [
    { subject: 'Mathematics', confidence: 6.5, score: 72 },
    { subject: 'Science', confidence: 7.2, score: 75 },
    { subject: 'English', confidence: 5.8, score: 68 }
  ];
  
  // Mock quiz results data that matches the QuizResult type
  const quizResults: QuizResult[] = [
    {
      userId: id || '1',
      subject: 'Mathematics',
      questionsAsked: ['m1', 'm2', 'm3'],
      answers: [
        { questionId: 'm1', userAnswer: '62', correct: true, topic: 'addition' },
        { questionId: 'm2', userAnswer: '55', correct: true, topic: 'subtraction' },
        { questionId: 'm3', userAnswer: '5', correct: true, topic: 'fractions' }
      ],
      confidenceBefore: 6,
      confidenceAfter: 7,
      score: 3,
      timestamp: '2025-04-10T10:30:00Z'
    },
    {
      userId: id || '1',
      subject: 'Science',
      questionsAsked: ['s1', 's2', 's3'],
      answers: [
        { questionId: 's1', userAnswer: 'Carbon dioxide', correct: true, topic: 'biology' },
        { questionId: 's2', userAnswer: 'photosynthesis', correct: true, topic: 'biology' },
        { questionId: 's3', userAnswer: 'gravity', correct: true, topic: 'physics' }
      ],
      confidenceBefore: 7,
      confidenceAfter: 8,
      score: 3,
      timestamp: '2025-04-08T14:15:00Z'
    },
    {
      userId: id || '1',
      subject: 'English',
      questionsAsked: ['e1', 'e2', 'e3'],
      answers: [
        { questionId: 'e1', userAnswer: 'beautiful', correct: true, topic: 'spelling' },
        { questionId: 'e2', userAnswer: 'London', correct: true, topic: 'nouns' },
        { questionId: 'e3', userAnswer: 'run', correct: true, topic: 'verbs' }
      ],
      confidenceBefore: 5,
      confidenceAfter: 6,
      score: 3,
      timestamp: '2025-04-05T09:45:00Z'
    }
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
