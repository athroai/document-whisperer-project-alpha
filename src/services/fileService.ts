
import { UploadedFile } from '@/types/auth';

// Mock database - In production this would connect to Firebase
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

export const uploadFile = async (fileData: Omit<UploadedFile, 'id' | 'timestamp'>): Promise<UploadedFile> => {
  // In a real app, this would upload to Firebase Storage
  const newFile: UploadedFile = {
    ...fileData,
    id: `file_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  
  mockFiles.push(newFile);
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
