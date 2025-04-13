
export interface School {
  id: string;
  name: string;
  licence_status: "trial" | "active" | "expired";
  trial_start: string;
  plan: string;
  students_allowed: number;
}

export interface Class {
  id: string;
  name: string;
  teacher_id: string;
  school_id: string;
  subject: string;
  student_ids: string[];
  yearGroup?: string; // Optional for backward compatibility
}

export interface TeacherPreference {
  teacherId: string;
  classId: string;
  markingStyle: "detailed" | "headline-only" | "encouraging";
  lastUpdated: string;
}

export interface UploadedResource {
  id: string;
  uploadedBy: string;
  role: string;
  subject: string;
  classId?: string;
  fileUrl: string;
  fileName: string;
  uploadTime: string;
  visibility: "public" | "class-only" | "private";
  type: "topic-notes" | "quiz" | "past-paper" | "notes";
}

export interface TeacherNotification {
  teacherId: string;
  type: "email" | "in-app" | "sms";
  enabled: boolean;
  frequency: "instant" | "daily" | "weekly";
}

export interface TeacherFeedback {
  teacherId: string;
  studentId: string;
  fileId: string;
  message: string;
  date: string;
}

export interface AssignedTask {
  teacherId: string;
  classId: string;
  title: string;
  description: string;
  fileUrls: string[];
  dueDate: string;
  assignedAt: string;
}

export interface ParentMessage {
  id: string;
  parentName: string;
  parentEmail: string;
  studentId: string;
  teacherId?: string;
  message: string;
  reply?: string;
  timestamp: string;
  status: 'unread' | 'read' | 'replied';
  topic: string;  // e.g., "Progress", "Wellbeing", "Homework"
  assignedTo: string | null;
  classId: string;
}

export interface StudentDetail {
  id: string;
  name: string;
  email: string;
  avatarSrc?: string;
  status: "approved" | "pending" | "removed";
  parentInquiry: boolean;
  performance: number;
  lastActive: string;
  classId: string;
  subjectScores?: {
    [subject: string]: number;
  };
  confidenceScores?: {
    [subject: string]: number;
  };
  attendance?: number;
  quizResults?: {
    quizId: string;
    subject: string;
    score: number;
    date: string;
  }[];
}

export interface Subject {
  id: string;
  name: string;
}
