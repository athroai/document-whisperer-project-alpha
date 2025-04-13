
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { EnrolledSubject } from '@/types/student';
import StudentClassService from '@/services/StudentClassService';
import { featureFlags } from '@/config/featureFlags';

interface StudentClassContextType {
  enrolledSubjects: EnrolledSubject[];
  loading: boolean;
  error: string | null;
  refreshSubjects: () => Promise<void>;
  isEnrolledInSubject: (subject: string) => boolean;
}

const StudentClassContext = createContext<StudentClassContextType>({
  enrolledSubjects: [],
  loading: true,
  error: null,
  refreshSubjects: async () => {},
  isEnrolledInSubject: () => false
});

export const useStudentClass = () => useContext(StudentClassContext);

export const StudentClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enrolledSubjects, setEnrolledSubjects] = useState<EnrolledSubject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { state } = useAuth();

  const fetchEnrolledSubjects = async () => {
    if (!state.user) {
      setEnrolledSubjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const subjects = await StudentClassService.getStudentClassLinks(state.user.id);
      const enrolled = await StudentClassService.getEnrolledSubjects(state.user.id);
      setEnrolledSubjects(enrolled);
      setError(null);
    } catch (err) {
      console.error('Error fetching enrolled subjects:', err);
      setError('Failed to load your enrolled subjects.');
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
    <StudentClassContext.Provider value={{ enrolledSubjects, loading, error, refreshSubjects, isEnrolledInSubject }}>
      {children}
    </StudentClassContext.Provider>
  );
};
