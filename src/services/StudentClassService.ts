
import { StudentClassLink, EnrolledSubject } from '@/types/student';
import { mockStudentClassLinks } from '@/data/mock/student-links';

export class StudentClassService {
  // Get all class links for a student
  static async getStudentClassLinks(studentId: string): Promise<StudentClassLink[]> {
    // In a real app, this would fetch from Firestore
    // For now, we're using mock data
    return mockStudentClassLinks.filter(link => link.studentId === studentId && link.active);
  }

  // Check if a student is enrolled in a specific subject
  static async isEnrolledInSubject(studentId: string, subject: string): Promise<boolean> {
    const links = await this.getStudentClassLinks(studentId);
    return links.some(link => 
      link.subject.toLowerCase() === subject.toLowerCase() && link.active
    );
  }

  // Get all subjects a student is enrolled in
  static async getEnrolledSubjects(studentId: string): Promise<EnrolledSubject[]> {
    const links = await this.getStudentClassLinks(studentId);
    
    // In a real implementation, we would fetch teacher names and class details
    return links.map(link => ({
      subject: link.subject,
      classId: link.classId,
      teacherId: link.teacherId,
      teacherName: "Mr. Smith", // Mock teacher name
      className: `${link.yearGroup} ${link.subject}`, // Mock class name
      yearGroup: link.yearGroup
    }));
  }
  
  // Get all students in a class (for TeacherSetsPage)
  static async getClassStudents(classId: string): Promise<any[]> {
    // Mock implementation - in a real app, this would query the database
    return [
      { id: 'student1', name: 'John Doe', yearGroup: '10', subjects: ['Maths', 'Science'] },
      { id: 'student2', name: 'Jane Smith', yearGroup: '10', subjects: ['Maths', 'English'] },
      { id: 'student3', name: 'Alex Johnson', yearGroup: '11', subjects: ['History', 'Science'] }
    ];
  }
}

export default StudentClassService;
