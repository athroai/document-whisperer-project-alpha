
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
      joinCode: `${link.classId}`, // Mock join code
      yearGroup: link.yearGroup
    }));
  }
}

export default StudentClassService;
