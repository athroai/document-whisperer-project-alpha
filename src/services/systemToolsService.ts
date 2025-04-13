
import { Class, StudentDetail } from '@/types/teacher';

// Mock data for classes
const mockClasses: Class[] = [
  {
    id: 'class-1a',
    name: '1A Mathematics',
    teacher_id: 'teacher1',
    school_id: 'school1',
    subject: 'Mathematics',
    student_ids: ['stu123', 'stu456', 'stu789'],
    yearGroup: 'Year 7'
  },
  {
    id: 'class-2b',
    name: '2B Science',
    teacher_id: 'teacher1',
    school_id: 'school1',
    subject: 'Science',
    student_ids: ['stu101', 'stu202', 'stu303'],
    yearGroup: 'Year 8'
  },
  {
    id: 'class-3c',
    name: '3C English',
    teacher_id: 'teacher1',
    school_id: 'school1',
    subject: 'English',
    student_ids: ['stu404', 'stu505', 'stu606', 'test123'],
    yearGroup: 'Year 9'
  }
];

// Mock student data
const mockStudents: StudentDetail[] = [
  {
    id: 'stu123',
    name: 'Ceri Evans',
    email: 'ceri@student.example.com',
    status: 'approved',
    parentInquiry: true,
    performance: 72,
    lastActive: '2025-04-12T14:30:00Z',
    classId: 'class-1a',
    attendance: 95
  },
  {
    id: 'stu456',
    name: 'Dylan Hughes',
    email: 'dylan@student.example.com',
    status: 'approved',
    parentInquiry: false,
    performance: 85,
    lastActive: '2025-04-11T10:15:00Z',
    classId: 'class-1a',
    attendance: 98
  },
  {
    id: 'stu789',
    name: 'Ffion Williams',
    email: 'ffion@student.example.com',
    status: 'approved',
    parentInquiry: false,
    performance: 68,
    lastActive: '2025-04-10T16:45:00Z',
    classId: 'class-1a',
    attendance: 92
  },
  {
    id: 'stu101',
    name: 'Iwan Jenkins',
    email: 'iwan@student.example.com',
    status: 'approved',
    parentInquiry: true,
    performance: 76,
    lastActive: '2025-04-12T09:20:00Z',
    classId: 'class-2b',
    attendance: 89
  },
  {
    id: 'stu202',
    name: 'Megan Davies',
    email: 'megan@student.example.com',
    status: 'approved',
    parentInquiry: true,
    performance: 90,
    lastActive: '2025-04-11T13:10:00Z',
    classId: 'class-2b',
    attendance: 97
  },
  {
    id: 'stu303',
    name: 'Owen Roberts',
    email: 'owen@student.example.com',
    status: 'approved',
    parentInquiry: false,
    performance: 82,
    lastActive: '2025-04-10T14:50:00Z',
    classId: 'class-2b',
    attendance: 94
  },
  {
    id: 'stu404',
    name: 'Rhian Thomas',
    email: 'rhian@student.example.com',
    status: 'approved',
    parentInquiry: false,
    performance: 78,
    lastActive: '2025-04-12T11:30:00Z',
    classId: 'class-3c',
    attendance: 91
  },
  {
    id: 'stu505',
    name: 'Sion Morgan',
    email: 'sion@student.example.com',
    status: 'approved',
    parentInquiry: false,
    performance: 88,
    lastActive: '2025-04-11T15:45:00Z',
    classId: 'class-3c',
    attendance: 96
  },
  {
    id: 'stu606',
    name: 'Tesni Jones',
    email: 'tesni@student.example.com',
    status: 'approved',
    parentInquiry: false,
    performance: 81,
    lastActive: '2025-04-10T12:25:00Z',
    classId: 'class-3c',
    attendance: 93
  },
  {
    id: 'test123',
    name: 'Test Student',
    email: 'test@student.example.com',
    status: 'approved',
    parentInquiry: false,
    performance: 50,
    lastActive: '2025-04-01T10:00:00Z',
    classId: 'class-3c',
    attendance: 65
  },
];

// Mock task templates
export const taskTemplates = [
  {
    id: 'task1',
    title: 'Algebra Review',
    description: 'Review core algebra concepts from chapters 3-5',
    subject: 'Mathematics'
  },
  {
    id: 'task2',
    title: 'Scientific Method Quiz',
    description: 'Complete the online quiz about the scientific method',
    subject: 'Science'
  },
  {
    id: 'task3',
    title: 'Essay Planning',
    description: 'Create an outline for your upcoming essay on modern literature',
    subject: 'English'
  },
  {
    id: 'task4',
    title: 'Revision Practice',
    description: 'Complete the practice questions for your upcoming assessment',
    subject: 'General'
  }
];

// Mock sync issues for Class Sync Check
export const syncIssues = [
  {
    classId: 'class-2b',
    issue: 'Missing subject assignment',
    severity: 'warning'
  },
  {
    classId: 'class-3c',
    issue: 'Contains test data',
    severity: 'info'
  }
];

export class SystemToolsService {
  /**
   * Get classes for a specific teacher
   */
  static async getClassesForTeacher(teacherId: string): Promise<Class[]> {
    // In a real app, we would fetch from Firestore here
    // For now, return mock data
    return Promise.resolve(mockClasses.filter(cls => cls.teacher_id === teacherId));
  }
  
  /**
   * Get students for a specific class
   */
  static async getStudentsForClass(classId: string): Promise<StudentDetail[]> {
    // In a real app, we would fetch from Firestore here
    return Promise.resolve(mockStudents.filter(student => student.classId === classId));
  }
  
  /**
   * Mock function to reset student session memory
   */
  static async resetStudentMemory(studentIds: string[]): Promise<void> {
    // In a real app, we would clear session data in Firestore
    console.log(`Resetting memory for students: ${studentIds.join(', ')}`);
    return Promise.resolve();
  }
  
  /**
   * Mock function to mark all students present
   */
  static async markAllPresent(classId: string, date: Date): Promise<void> {
    // In a real app, we would update attendance records in Firestore
    console.log(`Marking all students in class ${classId} present for ${date.toLocaleDateString()}`);
    return Promise.resolve();
  }
  
  /**
   * Mock function to assign a task to multiple students
   */
  static async assignTask(taskId: string, classIds: string[], dueDate: Date): Promise<void> {
    // In a real app, we would create task assignments in Firestore
    console.log(`Assigning task ${taskId} to classes: ${classIds.join(', ')} due on ${dueDate.toLocaleDateString()}`);
    return Promise.resolve();
  }
  
  /**
   * Mock function to delete test students
   */
  static async deleteTestStudents(studentIds: string[]): Promise<void> {
    // In a real app, we would delete students from Firestore
    console.log(`Deleting test students: ${studentIds.join(', ')}`);
    return Promise.resolve();
  }

  /**
   * Get system diagnostics
   */
  static getSystemDiagnostics(): {
    firestoreStatus: 'connected' | 'disconnected' | 'mock',
    environment: 'development' | 'production',
    systemTime: string,
    userSessionActive: boolean
  } {
    return {
      firestoreStatus: 'mock',
      environment: 'development',
      systemTime: new Date().toISOString(),
      userSessionActive: true
    };
  }
}
