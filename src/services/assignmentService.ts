
import { Assignment, Submission, FeedbackData } from '@/types/assignment';
import { toast } from '@/components/ui/use-toast';
import { getMarkingRecords, markAnswer } from './markingEngine';

// Toggle this to false when connecting to Firestore
const useMock = true;

// Mock storage
let mockAssignments: Assignment[] = [];
let mockSubmissions: Submission[] = [];

// Initialize with some sample assignments
const initializeMockData = () => {
  if (mockAssignments.length === 0) {
    mockAssignments = [
      {
        id: "assignment_1",
        title: "Percentage Quiz Practice",
        description: "Complete these 5 questions on percentages.",
        assignedBy: "teacher1",
        subject: "mathematics",
        topic: "percentages",
        classId: "class1",
        dueDate: "2025-04-20T23:59:00Z",
        creationDate: "2025-04-15T09:00:00Z",
        visibility: "active",
        assignmentType: "quiz",
        status: "published",
        linkedResources: ["quiz1"]
      },
      {
        id: "assignment_2",
        title: "Cell Structure Essay",
        description: "Write a short essay explaining cell structure and function.",
        assignedBy: "teacher1",
        subject: "science",
        topic: "cells",
        classId: "class2",
        dueDate: "2025-04-25T23:59:00Z",
        creationDate: "2025-04-16T10:30:00Z",
        visibility: "active",
        assignmentType: "open-answer",
        status: "published",
        linkedResources: []
      }
    ];
  }
  
  // Load from localStorage if available
  const storedAssignments = localStorage.getItem('assignments');
  if (storedAssignments) {
    try {
      mockAssignments = JSON.parse(storedAssignments);
    } catch (e) {
      console.error('Failed to parse stored assignments:', e);
    }
  }
  
  const storedSubmissions = localStorage.getItem('submissions');
  if (storedSubmissions) {
    try {
      mockSubmissions = JSON.parse(storedSubmissions);
    } catch (e) {
      console.error('Failed to parse stored submissions:', e);
    }
  }
};

// Mock implementation
const mockImplementation = {
  // Assignment methods
  getAssignments: async (filters?: {
    teacherId?: string;
    classId?: string;
    status?: "draft" | "published";
    visibility?: "active" | "archived";
  }): Promise<Assignment[]> => {
    initializeMockData();
    
    let filtered = [...mockAssignments];
    
    if (filters) {
      if (filters.teacherId) {
        filtered = filtered.filter(a => a.assignedBy === filters.teacherId);
      }
      
      if (filters.classId) {
        filtered = filtered.filter(a => a.classId === filters.classId);
      }
      
      if (filters.status) {
        filtered = filtered.filter(a => a.status === filters.status);
      }
      
      if (filters.visibility) {
        filtered = filtered.filter(a => a.visibility === filters.visibility);
      }
    }
    
    return filtered;
  },
  
  getAssignmentById: async (id: string): Promise<Assignment | null> => {
    initializeMockData();
    return mockAssignments.find(a => a.id === id) || null;
  },
  
  createAssignment: async (assignment: Omit<Assignment, "id">): Promise<Assignment> => {
    initializeMockData();
    
    const newAssignment: Assignment = {
      ...assignment,
      id: `assignment_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    };
    
    mockAssignments.push(newAssignment);
    localStorage.setItem('assignments', JSON.stringify(mockAssignments));
    
    return newAssignment;
  },
  
  updateAssignment: async (id: string, updates: Partial<Assignment>): Promise<Assignment | null> => {
    initializeMockData();
    
    const index = mockAssignments.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    mockAssignments[index] = {
      ...mockAssignments[index],
      ...updates
    };
    
    localStorage.setItem('assignments', JSON.stringify(mockAssignments));
    
    return mockAssignments[index];
  },
  
  // Submission methods
  getSubmissions: async (filters?: {
    assignmentId?: string;
    studentId?: string;
    status?: "submitted" | "marked" | "returned";
  }): Promise<Submission[]> => {
    initializeMockData();
    
    let filtered = [...mockSubmissions];
    
    if (filters) {
      if (filters.assignmentId) {
        filtered = filtered.filter(s => s.assignmentId === filters.assignmentId);
      }
      
      if (filters.studentId) {
        filtered = filtered.filter(s => s.submittedBy === filters.studentId);
      }
      
      if (filters.status) {
        filtered = filtered.filter(s => s.status === filters.status);
      }
    }
    
    return filtered;
  },
  
  getSubmissionById: async (id: string): Promise<Submission | null> => {
    initializeMockData();
    return mockSubmissions.find(s => s.id === id) || null;
  },
  
  createSubmission: async (submission: Omit<Submission, "id">): Promise<Submission> => {
    initializeMockData();
    
    const newSubmission: Submission = {
      ...submission,
      id: `submission_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    };
    
    mockSubmissions.push(newSubmission);
    localStorage.setItem('submissions', JSON.stringify(mockSubmissions));
    
    return newSubmission;
  },
  
  updateSubmission: async (id: string, updates: Partial<Submission>): Promise<Submission | null> => {
    initializeMockData();
    
    const index = mockSubmissions.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    mockSubmissions[index] = {
      ...mockSubmissions[index],
      ...updates
    };
    
    localStorage.setItem('submissions', JSON.stringify(mockSubmissions));
    
    return mockSubmissions[index];
  },
  
  // Teacher marking methods
  markSubmission: async (
    submissionId: string,
    feedback: FeedbackData
  ): Promise<Submission | null> => {
    initializeMockData();
    
    const index = mockSubmissions.findIndex(s => s.id === submissionId);
    if (index === -1) return null;
    
    mockSubmissions[index].teacherFeedback = feedback;
    mockSubmissions[index].status = "marked";
    
    localStorage.setItem('submissions', JSON.stringify(mockSubmissions));
    
    return mockSubmissions[index];
  },
  
  returnSubmission: async (submissionId: string): Promise<Submission | null> => {
    initializeMockData();
    
    const index = mockSubmissions.findIndex(s => s.id === submissionId);
    if (index === -1) return null;
    
    mockSubmissions[index].status = "returned";
    localStorage.setItem('submissions', JSON.stringify(mockSubmissions));
    
    return mockSubmissions[index];
  },
  
  // Methods for Athro integration
  getAssignmentsForAthro: async (studentId: string, subject: string): Promise<Assignment[]> => {
    initializeMockData();
    
    // Find the student's classes
    const studentClasses = ["class1", "class2"]; // In real app, fetch from student record
    
    // Get active assignments for those classes in the given subject
    return mockAssignments.filter(a => 
      studentClasses.includes(a.classId) &&
      a.subject === subject &&
      a.visibility === "active" &&
      a.status === "published" &&
      new Date(a.dueDate) > new Date()
    );
  }
};

// Firestore implementation (placeholder for future implementation)
const firestoreImplementation = {
  // Assignment methods
  getAssignments: async (filters?: {
    teacherId?: string;
    classId?: string;
    status?: "draft" | "published";
    visibility?: "active" | "archived";
  }): Promise<Assignment[]> => {
    // For now, use mock implementation
    return mockImplementation.getAssignments(filters);
  },
  
  getAssignmentById: async (id: string): Promise<Assignment | null> => {
    // For now, use mock implementation
    return mockImplementation.getAssignmentById(id);
  },
  
  createAssignment: async (assignment: Omit<Assignment, "id">): Promise<Assignment> => {
    // For now, use mock implementation
    return mockImplementation.createAssignment(assignment);
  },
  
  updateAssignment: async (id: string, updates: Partial<Assignment>): Promise<Assignment | null> => {
    // For now, use mock implementation
    return mockImplementation.updateAssignment(id, updates);
  },
  
  // Submission methods
  getSubmissions: async (filters?: {
    assignmentId?: string;
    studentId?: string;
    status?: "submitted" | "marked" | "returned";
  }): Promise<Submission[]> => {
    // For now, use mock implementation
    return mockImplementation.getSubmissions(filters);
  },
  
  getSubmissionById: async (id: string): Promise<Submission | null> => {
    // For now, use mock implementation
    return mockImplementation.getSubmissionById(id);
  },
  
  createSubmission: async (submission: Omit<Submission, "id">): Promise<Submission> => {
    // For now, use mock implementation
    return mockImplementation.createSubmission(submission);
  },
  
  updateSubmission: async (id: string, updates: Partial<Submission>): Promise<Submission | null> => {
    // For now, use mock implementation
    return mockImplementation.updateSubmission(id, updates);
  },
  
  // Teacher marking methods
  markSubmission: async (
    submissionId: string,
    feedback: FeedbackData
  ): Promise<Submission | null> => {
    // For now, use mock implementation
    return mockImplementation.markSubmission(submissionId, feedback);
  },
  
  returnSubmission: async (submissionId: string): Promise<Submission | null> => {
    // For now, use mock implementation
    return mockImplementation.returnSubmission(submissionId);
  },
  
  // Methods for Athro integration
  getAssignmentsForAthro: async (studentId: string, subject: string): Promise<Assignment[]> => {
    // For now, use mock implementation
    return mockImplementation.getAssignmentsForAthro(studentId, subject);
  }
};

// Export the appropriate implementation
export const assignmentService = useMock ? mockImplementation : firestoreImplementation;
