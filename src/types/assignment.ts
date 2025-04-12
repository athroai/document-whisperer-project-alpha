
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
}

export interface FeedbackData {
  score: number;
  outOf: number;
  comment: string;
  markedBy: string; // teacher id
  markedAt: string; // ISO date string
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
