
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
  id?: string;
  // Properties used in FileBrowser component
  bucket_name?: string;
  created_at?: string;
  description?: string;
  file_type?: string;
  file_url?: string;
  mime_type?: string;
  original_name?: string;
  set_id?: string;
  size?: number;
  storage_path?: string;
  topic?: string;
  
  // Properties needed for compatibility with existing code
  uploadedBy?: string;
  fileType?: string;
  storagePath?: string;
  timestamp?: string;
  subject?: string;
  uploaded_by?: string;
  visibility?: string;
  filename?: string;
  
  // Additional compatibility properties
  userId?: string;
  fileURL?: string;
  url?: string;
  mimeType?: string;
}
