
import { ParentMessage } from '@/types/teacher';

// Mock data for parent inquiries
const mockInquiries: ParentMessage[] = [
  {
    id: 'inq1',
    studentId: 'stu123',
    parentName: 'Llinos Evans',
    parentEmail: 'llinos@example.com',
    message: 'I'm worried about Ceri's confidence in maths.',
    topic: 'Wellbeing',
    timestamp: '2025-04-20T12:00:00Z',
    status: 'unread',
    assignedTo: null,
    classId: 'class-1a'
  },
  {
    id: 'inq2',
    studentId: 'stu456',
    parentName: 'David Jones',
    parentEmail: 'david.jones@example.com',
    message: 'Ffion has been struggling with the recent homework assignments. Are there any additional resources that might help?',
    topic: 'Homework',
    timestamp: '2025-04-19T09:30:00Z',
    status: 'read',
    assignedTo: 'teacher1',
    classId: 'class-2b'
  },
  {
    id: 'inq3',
    studentId: 'stu789',
    parentName: 'Sarah Williams',
    parentEmail: 'sarah@example.com',
    message: 'Owen has made significant progress in science lately. I wanted to thank you for the encouragement.',
    topic: 'Progress',
    timestamp: '2025-04-18T14:15:00Z',
    status: 'replied',
    reply: 'Thank you for your kind words. Owen has indeed been working very hard!',
    assignedTo: 'teacher1',
    classId: 'class-3c'
  },
  {
    id: 'inq4',
    studentId: 'stu101',
    parentName: 'Rhys Thompson',
    parentEmail: 'rhys@example.com',
    message: 'Megan will be absent for the next two days due to a family event. Could you please provide any work she will miss?',
    topic: 'Attendance',
    timestamp: '2025-04-17T11:45:00Z',
    status: 'unread',
    assignedTo: null,
    classId: 'class-1a'
  },
  {
    id: 'inq5',
    studentId: 'stu202',
    parentName: 'Catrin Roberts',
    parentEmail: 'catrin@example.com',
    message: 'I noticed Iwan struggled with the last quiz. Could we schedule a meeting to discuss strategies to help him improve?',
    topic: 'Progress',
    timestamp: '2025-04-16T16:20:00Z',
    status: 'unread',
    assignedTo: null,
    classId: 'class-2b'
  }
];

export class ParentInquiriesService {
  /**
   * Get inquiries for a specific teacher
   */
  static async getInquiriesForTeacher(teacherId: string): Promise<ParentMessage[]> {
    // In a real app, we would fetch from Firestore here
    // For now, return mock data
    return Promise.resolve(mockInquiries);
  }

  /**
   * Mark an inquiry as read
   */
  static async markAsRead(inquiryId: string): Promise<void> {
    // In a real app, we would update Firestore here
    console.log(`Marking inquiry ${inquiryId} as read`);
    return Promise.resolve();
  }

  /**
   * Send a reply to a parent inquiry
   */
  static async sendReply(inquiryId: string, teacherId: string, replyText: string): Promise<void> {
    // In a real app, we would update Firestore and send an email here
    console.log(`Sending reply to inquiry ${inquiryId} from teacher ${teacherId}: ${replyText}`);
    return Promise.resolve();
  }

  /**
   * Get the count of unread inquiries for a specific teacher
   */
  static async getUnreadCount(teacherId: string): Promise<number> {
    // In a real app, we would query Firestore here
    const inquiries = await this.getInquiriesForTeacher(teacherId);
    return inquiries.filter(inquiry => inquiry.status === 'unread').length;
  }
}
