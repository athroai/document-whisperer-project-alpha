
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StudentClassLink, EnrolledSubject } from '@/types/student';
import { StudentClassService } from '@/services/studentClassService';

interface StudentClassContextType {
  enrolledClasses: StudentClassLink[];
  enrolledSubjects: EnrolledSubject[];
  loading: boolean;
  isEnrolledInSubject: (subject: string) => boolean;
  refreshEnrollments: () => Promise<void>;
}

const StudentClassContext = createContext<StudentClassContextType>({
  enrolledClasses: [],
  enrolledSubjects: [],
  loading: true,
  isEnrolledInSubject: () => false,
  refreshEnrollments: async () => {}
});

export const useStudentClass = () => useContext(StudentClassContext);

export const StudentClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();
  const [enrolledClasses, setEnrolledClasses] = useState<StudentClassLink[]>([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState<EnrolledSubject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const refreshEnrollments = async () => {
    if (!state.user || state.user.role !== 'student') {
      setEnrolledClasses([]);
      setEnrolledSubjects([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const classes = await StudentClassService.getStudentClasses(state.user.id);
      const subjects = await StudentClassService.getEnrolledSubjects(state.user.id);
      
      setEnrolledClasses(classes);
      setEnrolledSubjects(subjects);
    } catch (error) {
      console.error('Error fetching student enrollments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    refreshEnrollments();
  }, [state.user]);
  
  const isEnrolledInSubject = (subject: string): boolean => {
    return enrolledSubjects.some(s => 
      s.subject.toLowerCase() === subject.toLowerCase()
    );
  };
  
  const value = {
    enrolledClasses,
    enrolledSubjects,
    loading,
    isEnrolledInSubject,
    refreshEnrollments
  };
  
  return (
    <StudentClassContext.Provider value={value}>
      {children}
    </StudentClassContext.Provider>
  );
};
