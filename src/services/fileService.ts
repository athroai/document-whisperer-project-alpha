
import { UploadedFile } from '@/types/auth';
import { toast } from '@/components/ui/use-toast';

// Mock Firebase Storage and Firestore - In production this would connect to Firebase
const mockFiles: UploadedFile[] = [
  {
    id: 'file_1',
    uploadedBy: 'user_1',
    subject: 'mathematics',
    fileType: 'paper',
    visibility: 'public',
    filename: 'algebra_practice.pdf',
    storagePath: 'files/user_1/algebra_practice.pdf',
    timestamp: new Date().toISOString(),
    label: 'Algebra practice paper'
  },
  {
    id: 'file_2',
    uploadedBy: 'user_1',
    subject: 'science',
    fileType: 'notes',
    visibility: 'private',
    filename: 'chemistry_notes.pdf',
    storagePath: 'files/user_1/chemistry_notes.pdf',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    label: 'Chemistry revision notes'
  }
];

// New interface for teacher preferences
export interface TeacherPreference {
  teacherId: string;
  classId: string;
  markingStyle: 'detailed' | 'headline-only' | 'encouraging';
  lastUpdated: string;
}

const mockTeacherPreferences: TeacherPreference[] = [
  {
    teacherId: 'teacher_1',
    classId: 'class_1',
    markingStyle: 'detailed',
    lastUpdated: new Date().toISOString()
  }
];

// File upload function - would connect to Firebase Storage in production
export const uploadFile = async (
  file: File, 
  metadata: {
    uploadedBy: string;
    role: string;
    subject: string;
    classId?: string;
    visibility: 'public' | 'class-only' | 'private';
    type: 'topic-notes' | 'quiz' | 'past-paper' | 'notes';
  }
): Promise<UploadedFile> => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real app, this would upload to Firebase Storage
  // and store metadata in Firestore
  const fileUrl = `https://storage.example.com/${metadata.uploadedBy}/${file.name}`;
  
  const newFile: UploadedFile = {
    id: `file_${Date.now()}`,
    uploadedBy: metadata.uploadedBy,
    subject: metadata.subject,
    fileType: metadata.type,
    visibility: metadata.visibility,
    filename: file.name,
    storagePath: `files/${metadata.uploadedBy}/${file.name}`,
    timestamp: new Date().toISOString(),
    label: file.name
  };
  
  mockFiles.push(newFile);
  
  console.log('File uploaded:', newFile);
  return newFile;
};

export const getUserFiles = async (userId: string): Promise<UploadedFile[]> => {
  // In a real app, this would query Firestore
  return mockFiles.filter(file => 
    file.uploadedBy === userId || file.visibility === 'public'
  );
};

export const getFilesBySubject = async (subject: string): Promise<UploadedFile[]> => {
  // In a real app, this would query Firestore
  return mockFiles.filter(file => file.subject === subject);
};

export const getRecentFiles = async (userId: string, limit: number = 5): Promise<UploadedFile[]> => {
  // In a real app, this would query Firestore
  return mockFiles
    .filter(file => file.uploadedBy === userId || file.visibility === 'public')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
};

// Teacher preferences functions
export const saveMarkingStyle = async (
  teacherId: string,
  classId: string,
  markingStyle: 'detailed' | 'headline-only' | 'encouraging'
): Promise<TeacherPreference> => {
  // In a real app, this would update Firestore
  const existingPrefIndex = mockTeacherPreferences.findIndex(
    pref => pref.teacherId === teacherId && pref.classId === classId
  );
  
  const updatedPref = {
    teacherId,
    classId,
    markingStyle,
    lastUpdated: new Date().toISOString()
  };
  
  if (existingPrefIndex >= 0) {
    // Update existing preference
    mockTeacherPreferences[existingPrefIndex] = updatedPref;
  } else {
    // Create new preference
    mockTeacherPreferences.push(updatedPref);
  }
  
  console.log('Marking style updated:', updatedPref);
  return updatedPref;
};

export const getTeacherPreference = async (
  teacherId: string,
  classId: string
): Promise<TeacherPreference | undefined> => {
  // In a real app, this would query Firestore
  return mockTeacherPreferences.find(
    pref => pref.teacherId === teacherId && pref.classId === classId
  );
};
