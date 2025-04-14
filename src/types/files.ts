
export interface UploadMetadata {
  url: string;
  filename: string;
  mimeType: string;
  uploadedBy: string;
  subject?: string;
  classId?: string;
  uploadTime?: string;
  visibility?: 'private' | 'class-only' | 'public';
}

export interface UploadedFile {
  id?: string; // Make id optional to match fileService implementation
  uploadedBy: string;
  subject: string;
  fileType: string; // 'paper', 'notes', 'quiz', etc.
  visibility: string; // 'public', 'private', 'class-only'
  filename: string;
  storagePath: string;
  timestamp: string;
  label?: string;
  mimeType?: string;
  url?: string;
  // Adding properties needed for compatibility with fileService implementation
  userId?: string;
  fileURL?: string;
  originalName?: string;
  description?: string;
  size?: number;
  createdAt?: Date;
}
