
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
  id: string;
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
}
