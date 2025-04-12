import React, { useState, useEffect } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import StudentsList from '@/components/dashboard/StudentsList';
import StudentDetail from '@/components/dashboard/StudentDetail';
import { calculateClassAverages } from '@/utils/dashboardUtils';
import { QuizResult } from '@/types/quiz';

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
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [students, setStudents] = useState(mockStudents);
  
  // Load quiz results from localStorage when the component mounts
  useEffect(() => {
    const savedResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    if (savedResults.length > 0) {
      setQuizResults(savedResults);
    }
  }, []);

  // Update students data with quiz results
  useEffect(() => {
    if (quizResults.length === 0) return;
    
    const updatedStudents = [...students];
    
    // Process each quiz result
    quizResults.forEach(result => {
      // Find the student by userId
      const studentIndex = updatedStudents.findIndex(s => s.id === result.userId);
      if (studentIndex === -1) return;
      
      const student = updatedStudents[studentIndex];
      
      // Update last quiz info
      const quizDate = new Date(result.timestamp);
      const formattedDate = `${quizDate.getFullYear()}-${String(quizDate.getMonth() + 1).padStart(2, '0')}-${String(quizDate.getDate()).padStart(2, '0')}`;
      
      if (!student.lastQuiz || new Date(student.lastQuiz.date) < quizDate) {
        student.lastQuiz = {
          date: formattedDate,
          score: (result.score / result.questionsAsked.length) * 100,
          subject: result.subject
        };
      }
      
      // Update subject data
      const subjectKey = result.subject.toLowerCase();
      if (student.subjects[subjectKey]) {
        // Update average score
        const scorePercent = (result.score / result.questionsAsked.length) * 100;
        student.subjects[subjectKey].averageScore = 
          (student.subjects[subjectKey].averageScore + scorePercent) / 2;
          
        // Update confidence
        student.subjects[subjectKey].confidence = result.confidenceAfter;
        
        // Update sessions count
        student.subjects[subjectKey].sessionsThisWeek += 1;
      }
      
      // Update confidence trend
      const today = new Date();
      if (quizDate.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) { // If quiz is from the last 7 days
        student.confidenceTrend.push({
          date: formattedDate,
          confidence: result.confidenceAfter
        });
        
        // Sort by date and keep only the most recent 5 entries
        student.confidenceTrend.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        student.confidenceTrend = student.confidenceTrend.slice(-5);
      }
    });
    
    setStudents(updatedStudents);
  }, [quizResults]);
  
  // Find the selected student from the updated students list
  const student = selectedStudent 
    ? students.find(s => s.id === selectedStudent) 
    : null;
    
  // Calculate class averages for the trends tab
  const classAveragesData = calculateClassAverages(students);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <DashboardHeader 
        markingStyle={markingStyle} 
        setMarkingStyle={setMarkingStyle} 
      />

      {/* Stats Cards */}
      <StatsCards 
        studentCount={students.length}
        quizCount={quizResults.length}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <StudentsList 
          students={students} 
          selectedStudent={selectedStudent} 
          setSelectedStudent={setSelectedStudent} 
        />

        {/* Student Detail */}
        <StudentDetail 
          student={student} 
          classAveragesData={classAveragesData} 
          quizResults={quizResults.filter(result => student && result.userId === student.id)}
        />
      </div>
    </div>
  );
};

export default TeacherDashboardPage;
