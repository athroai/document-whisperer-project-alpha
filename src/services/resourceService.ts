
import { toast } from '@/components/ui/use-toast';

// Define types for assigned resources
export interface AssignedResource {
  id: string;
  teacherId: string;
  classId: string;
  studentIds?: string[];
  resourceType: 'file' | 'link' | 'ai-instruction';
  fileId?: string;
  fileUrl?: string;
  linkUrl?: string;
  aiInstruction?: string;
  deployedAt: string;
  subject: string;
  topic?: string;
  title?: string;
}

// Define types for completed resources
export interface CompletedResource {
  id: string;
  resourceId: string;
  studentId: string;
  completedAt: string;
  feedback?: string;
}

// Mock data for assigned resources
const mockAssignedResources: AssignedResource[] = [
  {
    id: 'res1',
    teacherId: 'teacher1',
    classId: 'class1',
    resourceType: 'file',
    fileUrl: 'https://example.com/files/math-worksheet.pdf',
    deployedAt: '2023-04-01T10:00:00.000Z',
    subject: 'Mathematics',
    topic: 'Algebra',
    title: 'Algebra Practice Worksheet'
  },
  {
    id: 'res2',
    teacherId: 'teacher1',
    classId: 'class2',
    studentIds: ['student1', 'student2'],
    resourceType: 'link',
    linkUrl: 'https://www.khanacademy.org/science/biology',
    deployedAt: '2023-04-02T14:30:00.000Z',
    subject: 'Science',
    topic: 'Biology',
    title: 'Khan Academy: Biology Basics'
  },
  {
    id: 'res3',
    teacherId: 'teacher2',
    classId: 'class3',
    resourceType: 'ai-instruction',
    fileUrl: 'https://example.com/files/english-essay.pdf',
    aiInstruction: 'Review this essay and identify three areas for improvement in the conclusion.',
    deployedAt: '2023-04-03T09:15:00.000Z',
    subject: 'English',
    topic: 'Essay Writing',
    title: 'Essay Structure Analysis'
  }
];

// Mock data for completed resources
const mockCompletedResources: CompletedResource[] = [
  {
    id: 'comp1',
    resourceId: 'res1',
    studentId: 'student3',
    completedAt: '2023-04-05T11:45:00.000Z'
  },
  {
    id: 'comp2',
    resourceId: 'res2',
    studentId: 'student1',
    completedAt: '2023-04-07T16:20:00.000Z',
    feedback: 'Found this very helpful for my test prep.'
  }
];

// Function to assign a new resource
export const assignResource = async (resource: Omit<AssignedResource, 'id'>): Promise<AssignedResource> => {
  // In a real app, this would send data to Firestore
  const newResource: AssignedResource = {
    ...resource,
    id: `res${Date.now()}`,
  };
  
  console.log('Assigning resource:', newResource);
  mockAssignedResources.push(newResource);
  
  return newResource;
};

// Function to get resources assigned by a teacher
export const getTeacherResources = async (teacherId: string): Promise<AssignedResource[]> => {
  // In a real app, this would query Firestore
  return mockAssignedResources.filter(resource => resource.teacherId === teacherId);
};

// Function to get resources assigned to a class
export const getClassResources = async (classId: string): Promise<AssignedResource[]> => {
  // In a real app, this would query Firestore
  return mockAssignedResources.filter(resource => resource.classId === classId);
};

// Function to get resources assigned to a student
export const getStudentResources = async (studentId: string): Promise<AssignedResource[]> => {
  // In a real app, this would query Firestore with complex logic
  // Here we simplify by returning resources either assigned to classes or specifically to the student
  return mockAssignedResources.filter(resource => 
    resource.studentIds?.includes(studentId) || 
    !resource.studentIds // Resources assigned to entire class
  );
};

// Function to mark a resource as completed
export const markResourceComplete = async (
  resourceId: string, 
  studentId: string, 
  feedback?: string
): Promise<CompletedResource> => {
  // In a real app, this would update Firestore
  const existingCompletion = mockCompletedResources.find(
    comp => comp.resourceId === resourceId && comp.studentId === studentId
  );
  
  if (existingCompletion) {
    // Update existing completion
    existingCompletion.completedAt = new Date().toISOString();
    if (feedback) {
      existingCompletion.feedback = feedback;
    }
    return existingCompletion;
  }
  
  // Create new completion
  const newCompletion: CompletedResource = {
    id: `comp${Date.now()}`,
    resourceId,
    studentId,
    completedAt: new Date().toISOString(),
    feedback
  };
  
  mockCompletedResources.push(newCompletion);
  return newCompletion;
};

// Function to get completed resources for a student
export const getStudentCompletedResources = async (studentId: string): Promise<string[]> => {
  // In a real app, this would query Firestore
  return mockCompletedResources
    .filter(comp => comp.studentId === studentId)
    .map(comp => comp.resourceId);
};

// Function to get completion stats for a resource
export const getResourceCompletionStats = async (resourceId: string): Promise<{
  completedCount: number;
  totalAssigned: number;
}> => {
  // In a real app, this would query Firestore
  const resource = mockAssignedResources.find(res => res.id === resourceId);
  if (!resource) {
    return { completedCount: 0, totalAssigned: 0 };
  }
  
  const completions = mockCompletedResources.filter(comp => comp.resourceId === resourceId);
  
  // If assigned to specific students, count them, otherwise count all students in the class
  const totalAssigned = resource.studentIds?.length || 20; // Mock class size as 20
  
  return {
    completedCount: completions.length,
    totalAssigned
  };
};

export default {
  assignResource,
  getTeacherResources,
  getClassResources,
  getStudentResources,
  markResourceComplete,
  getStudentCompletedResources,
  getResourceCompletionStats
};
