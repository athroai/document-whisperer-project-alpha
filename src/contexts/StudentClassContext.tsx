
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { EnrolledSubject } from '@/types/student';
import StudentClassService from '@/services/StudentClassService';
import { featureFlags } from '@/config/featureFlags';

// Mock data for simulating enrolled subjects
const mockSubjects: EnrolledSubject[] = [
  {
    subject: 'Mathematics',
    classId: 'mock-math-101',
    teacherId: 'mock-teacher-1',
    teacherName: 'Mr. Smith (Mock)',
    className: 'Mock Class: Maths 9A',
    yearGroup: 'Year 9',
  },
  {
    subject: 'Science',
    classId: 'mock-sci-102',
    teacherId: 'mock-teacher-2',
    teacherName: 'Ms. Johnson (Mock)',
    className: 'Mock Class: Science 10B',
    yearGroup: 'Year 10',
  },
  {
    subject: 'English',
    classId: 'mock-eng-103',
    teacherId: 'mock-teacher-3',
    teacherName: 'Dr. Williams (Mock)',
    className: 'Mock Class: English 8C',
    yearGroup: 'Year 8',
  }
];

interface StudentClassContextType {
  enrolledSubjects: EnrolledSubject[];
  loading: boolean;
  error: string | null;
  refreshSubjects: () => Promise<void>;
  isEnrolledInSubject: (subject: string) => boolean;
  isMockEnrollment: boolean;
}

const StudentClassContext = createContext<StudentClassContextType>({
  enrolledSubjects: [],
  loading: true,
  error: null,
  refreshSubjects: async () => {},
  isEnrolledInSubject: () => false,
  isMockEnrollment: false
});

export const useStudentClass = () => useContext(StudentClassContext);

export const StudentClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enrolledSubjects, setEnrolledSubjects] = useState<EnrolledSubject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockEnrollment, setIsMockEnrollment] = useState<boolean>(false);
  const { state } = useAuth();

  const fetchEnrolledSubjects = async () => {
    if (!state.user) {
      setEnrolledSubjects([]);
      setLoading(false);
      setIsMockEnrollment(false);
      return;
    }

    try {
      setLoading(true);
      const subjects = await StudentClassService.getStudentClassLinks(state.user.id);
      const enrolled = await StudentClassService.getEnrolledSubjects(state.user.id);
      
      // Check if we should inject mock subjects
      if (featureFlags.mockEnrollmentEnabled && enrolled.length === 0) {
        console.log('[StudentClassContext] Using mock enrollment data');
        setEnrolledSubjects(mockSubjects);
        setIsMockEnrollment(true);
      } else {
        setEnrolledSubjects(enrolled);
        setIsMockEnrollment(false);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching enrolled subjects:', err);
      
      // Fallback to mock data if enabled and there was an error
      if (featureFlags.mockEnrollmentEnabled) {
        console.log('[StudentClassContext] Using mock enrollment data due to error');
        setEnrolledSubjects(mockSubjects);
        setIsMockEnrollment(true);
        setError(null);
      } else {
        setError('Failed to load your enrolled subjects.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledSubjects();
  }, [state.user]);

  const refreshSubjects = async () => {
    await fetchEnrolledSubjects();
  };

  const isEnrolledInSubject = (subject: string): boolean => {
    return enrolledSubjects.some(
      enrolledSubject => enrolledSubject.subject.toLowerCase() === subject.toLowerCase()
    );
  };

  return (
    <StudentClassContext.Provider value={{ 
      enrolledSubjects, 
      loading, 
      error, 
      refreshSubjects, 
      isEnrolledInSubject,
      isMockEnrollment
    }}>
      {children}
    </StudentClassContext.Provider>
  );
};
