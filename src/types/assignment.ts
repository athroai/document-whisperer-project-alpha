
export interface Assignment {
  id: string;
  title: string;
  description: string;
  assignedBy: string; // teacher id
  subject: string;
  topic: string | null;
  classId: string;
  dueDate: string; // ISO date string
  creationDate: string; // ISO date string
  visibility: "active" | "archived";
  assignmentType: "quiz" | "file-upload" | "open-answer";
  status: "draft" | "published";
  linkedResources: string[]; // array of resource ids
  instructions?: string;
  filesAttached?: string[];
  aiSupportEnabled?: boolean; // New field to indicate if AI support is enabled
}

export interface Submission {
  id: string;
  assignmentId: string;
  submittedBy: string; // student id
  submittedAt: string; // ISO date string
  status: "submitted" | "marked" | "returned";
  answers: QuizAnswer[] | FileUploadAnswer | OpenAnswer;
  teacherFeedback: FeedbackData | null;
  aiFeedback: AIFeedback | null;
  studentComment: string | null;
  markedByAI?: boolean;
  markedByTeacher?: boolean;
  returnedToStudent?: boolean;
}

export interface FeedbackData {
  score: number;
  outOf: number;
  comment: string;
  markedBy: string; // teacher id
  markedAt: string; // ISO date string
  rating?: "needs_improvement" | "good" | "excellent"; // New field to store teacher rating
}

export interface AIFeedback {
  score: number;
  comment: string;
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect?: boolean;
}

export interface FileUploadAnswer {
  fileUrls: string[];
  fileNames: string[];
}

export interface OpenAnswer {
  text: string;
}

// New type for student assignment view
export interface StudentAssignmentView {
  assignment: Assignment;
  submission: Submission | null;
  hasSubmitted: boolean;
  isPastDue: boolean;
  daysUntilDue: number;
  hasFeedback: boolean;
  inProgress?: boolean; // New field to indicate if the assignment is in progress
}

// New type for assignment statistics
export interface AssignmentStats {
  totalStudents: number;
  submitted: number;
  notStarted: number;
  inProgress: number;
  marked: number;
  averageScore?: number;
}
