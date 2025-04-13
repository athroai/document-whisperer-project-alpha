
import { StudentClassLink, EnrolledSubject } from '@/types/student';
import { mockStudentClassLinks } from '@/data/mock/student-links';
import { Class } from '@/types/teacher';

// Mock class data
const mockClasses: Record<string, { name: string, joinCode: string }> = {
  'class-1a': { name: 'Set 1', joinCode: 'MATH7X1' },
  'class-2b': { name: 'Set 1', joinCode: 'SCI8X1' },
  'class-3c': { name: 'Set 1', joinCode: 'ENG9X1' }
};

// Mock teacher data
const mockTeachers: Record<string, string> = {
  'teacher1': 'Ms. Jenkins',
  'teacher2': 'Mr. Williams'
};

export class StudentClassService {
  /**
   * Get all classes a student is enrolled in
   */
  static async getStudentClasses(studentId: string): Promise<StudentClassLink[]> {
    // In a real app, we would fetch from Firestore here
    // For now, return mock data
    return Promise.resolve(mockStudentClassLinks.filter(link => link.studentId === studentId && link.active));
  }
  
  /**
   * Get all students in a specific class
   */
  static async getClassStudents(classId: string): Promise<string[]> {
    // In a real app, we would fetch from Firestore here
    const links = mockStudentClassLinks.filter(link => link.classId === classId && link.active);
    return Promise.resolve(links.map(link => link.studentId));
  }
  
  /**
   * Get all enrolled subjects for a student with additional metadata
   */
  static async getEnrolledSubjects(studentId: string): Promise<EnrolledSubject[]> {
    // Get student class links
    const links = mockStudentClassLinks.filter(link => link.studentId === studentId && link.active);
    
    // Transform to include additional class and teacher info
    return Promise.resolve(links.map(link => ({
      subject: link.subject,
      classId: link.classId,
      teacherId: link.teacherId,
      teacherName: mockTeachers[link.teacherId] || 'Unknown Teacher',
      className: mockClasses[link.classId]?.name || 'Unknown Class',
      joinCode: mockClasses[link.classId]?.joinCode || 'UNKNOWN',
      yearGroup: link.yearGroup
    })));
  }
  
  /**
   * Check if student is enrolled in a specific subject
   */
  static async isEnrolledInSubject(studentId: string, subject: string): Promise<boolean> {
    const links = mockStudentClassLinks.filter(link => 
      link.studentId === studentId && 
      link.subject.toLowerCase() === subject.toLowerCase() && 
      link.active
    );
    return Promise.resolve(links.length > 0);
  }
  
  /**
   * Enroll a student in a class
   */
  static async enrollStudent(studentId: string, classId: string, teacherId: string, subject: string, yearGroup: string): Promise<StudentClassLink> {
    // In a real app, we would add to Firestore here
    const newLink: StudentClassLink = {
      id: `scl-${Date.now()}`,
      studentId,
      classId,
      subject,
      teacherId,
      yearGroup,
      joinedAt: new Date().toISOString(),
      active: true
    };
    
    // Here we would add to Firestore
    console.log(`Enrolled student ${studentId} in class ${classId} for subject ${subject}`);
    
    return Promise.resolve(newLink);
  }
  
  /**
   * Remove a student from a class
   */
  static async unenrollStudent(linkId: string): Promise<void> {
    // In a real app, we would update Firestore to set active = false
    console.log(`Unenrolled student with link ID ${linkId}`);
    return Promise.resolve();
  }
  
  /**
   * Get all students by subject for a teacher
   */
  static async getStudentsBySubject(teacherId: string, subject: string): Promise<string[]> {
    const links = mockStudentClassLinks.filter(link => 
      link.teacherId === teacherId && 
      link.subject.toLowerCase() === subject.toLowerCase() && 
      link.active
    );
    return Promise.resolve(links.map(link => link.studentId));
  }
}
