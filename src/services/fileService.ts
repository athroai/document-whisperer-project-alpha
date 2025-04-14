
import { supabase } from '@/integrations/supabase/client';

export interface UploadedFile {
  id?: string;
  userId: string;
  filename: string;
  fileType: 'paper' | 'notes' | 'quiz' | string; // Allow string to accommodate more types
  fileURL: string;
  originalName: string;
  subject?: string;
  description?: string;
  size?: number;
  createdAt?: Date;
  // Add properties needed for UploadMetadata compatibility
  url?: string;
  mimeType?: string;
  uploadedBy?: string;
  visibility?: string;
  storagePath?: string;
  timestamp?: string;
  bucket_name?: string; // Add this since it's used in the code
}

export interface UploadProgress {
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export type TeacherPreference = "detailed" | "headline-only" | "encouraging";

// Save marking style preference for a teacher
export const saveMarkingStyle = async (
  userId: string, 
  classId: string, 
  style: TeacherPreference
): Promise<void> => {
  try {
    // Fix: Replace with a teacher_preferences table in Supabase
    const { error } = await supabase
      .from('profiles')
      .update({
        marking_style: style,
      })
      .eq('id', userId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error saving marking style:', error);
    throw error;
  }
};

// Get recent files for a user
export const getRecentFiles = async (userId: string): Promise<UploadedFile[]> => {
  try {
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('uploaded_by', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(file => ({
      id: file.id,
      userId: file.uploaded_by,
      filename: file.filename,
      fileType: file.file_type as 'paper' | 'notes' | 'quiz',
      fileURL: file.file_url,
      originalName: file.original_name,
      subject: file.subject,
      description: file.description,
      size: file.size,
      createdAt: new Date(file.created_at),
      url: file.file_url,
      mimeType: file.mime_type || 'application/octet-stream',
      uploadedBy: file.uploaded_by,
      visibility: file.visibility || 'private',
      storagePath: file.storage_path,
      timestamp: file.created_at,
      bucket_name: file.bucket_name,
    }));
  } catch (error) {
    console.error('Error getting recent files:', error);
    throw error;
  }
};

// Get files by subject for a user
export const getFilesBySubject = async (userId: string, subject: string): Promise<UploadedFile[]> => {
  try {
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('uploaded_by', userId)
      .eq('subject', subject)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(file => ({
      id: file.id,
      userId: file.uploaded_by,
      filename: file.filename,
      fileType: file.file_type as 'paper' | 'notes' | 'quiz',
      fileURL: file.file_url,
      originalName: file.original_name,
      subject: file.subject,
      description: file.description,
      size: file.size,
      createdAt: new Date(file.created_at),
      url: file.file_url,
      mimeType: file.mime_type || 'application/octet-stream',
      uploadedBy: file.uploaded_by,
      visibility: file.visibility || 'private',
      storagePath: file.storage_path,
      timestamp: file.created_at,
      bucket_name: file.bucket_name,
    }));
  } catch (error) {
    console.error('Error getting files by subject:', error);
    throw error;
  }
};

// Upload file with metadata
export const uploadFile = async (
  file: File,
  metadata: {
    uploadedBy: string;
    subject?: string;
    classId?: string;
    visibility?: 'private' | 'class-only' | 'public';
    type?: 'topic-notes' | 'quiz' | 'past-paper' | 'notes';
    role?: string;
  }
) => {
  try {
    if (!file) throw new Error('No file provided');
    
    // Create a unique filename
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${metadata.uploadedBy}_${timestamp}.${fileExtension}`;
    
    // Upload to Supabase Storage
    const storagePath = `uploads/${metadata.uploadedBy}/${uniqueFilename}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('student_uploads')
      .upload(storagePath, file);
      
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('student_uploads')
      .getPublicUrl(storagePath);
      
    const downloadURL = urlData?.publicUrl;
    
    // Save metadata to Supabase
    const uploadMetadata = {
      filename: uniqueFilename,
      original_name: file.name,
      file_url: downloadURL,
      mime_type: file.type,
      uploaded_by: metadata.uploadedBy,
      subject: metadata.subject,
      set_id: metadata.classId,
      visibility: metadata.visibility || 'private',
      file_type: metadata.type || 'notes',
      storage_path: storagePath,
      bucket_name: 'student_uploads',
      size: file.size
    };
    
    const { data: metadataData, error: metadataError } = await supabase
      .from('uploads')
      .insert(uploadMetadata)
      .select()
      .single();
      
    if (metadataError) throw metadataError;
    
    return {
      ...uploadMetadata,
      id: metadataData.id,
      url: downloadURL,
      uploadedBy: metadata.uploadedBy,
      uploadTime: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const fileService = {
  // Upload a file to Supabase Storage
  uploadFile: async (
    file: File, 
    userId: string, 
    metadata: { 
      fileType: 'paper' | 'notes' | 'quiz';
      subject?: string;
      description?: string;
    },
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedFile> => {
    try {
      if (!file) throw new Error('No file provided');
      
      // Create a unique filename
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop();
      const uniqueFilename = `${userId}_${timestamp}.${fileExtension}`;
      const storagePath = `uploads/${userId}/${uniqueFilename}`;
      
      // Start upload
      onProgress?.({ progress: 0, status: 'uploading' });
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('student_uploads')
        .upload(storagePath, file);
        
      if (uploadError) throw uploadError;
      
      onProgress?.({ progress: 50, status: 'uploading' });
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('student_uploads')
        .getPublicUrl(storagePath);
        
      const downloadURL = urlData?.publicUrl;
      
      // Save metadata to Supabase
      const fileData = {
        uploaded_by: userId,
        filename: uniqueFilename,
        file_url: downloadURL,
        original_name: file.name,
        file_type: metadata.fileType,
        subject: metadata.subject,
        description: metadata.description,
        size: file.size,
        mime_type: file.type,
        storage_path: storagePath,
        bucket_name: 'student_uploads',
        visibility: 'private'
      };
      
      const { data: metadataData, error: metadataError } = await supabase
        .from('uploads')
        .insert(fileData)
        .select()
        .single();
        
      if (metadataError) throw metadataError;
      
      onProgress?.({ progress: 100, status: 'success' });
      
      return {
        id: metadataData.id,
        userId,
        filename: uniqueFilename,
        fileURL: downloadURL,
        originalName: file.name,
        fileType: metadata.fileType,
        subject: metadata.subject,
        description: metadata.description,
        size: file.size,
        url: downloadURL,
        mimeType: file.type,
        uploadedBy: userId,
        visibility: 'private',
        storagePath,
        timestamp: new Date().toISOString(),
        createdAt: new Date(),
        bucket_name: 'student_uploads'
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      onProgress?.({ 
        progress: 0, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  },

  // Get all files for a user
  getUserFiles: async (userId: string): Promise<UploadedFile[]> => {
    try {
      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .eq('uploaded_by', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data.map(file => ({
        id: file.id,
        userId: file.uploaded_by,
        filename: file.filename,
        fileType: file.file_type as 'paper' | 'notes' | 'quiz',
        fileURL: file.file_url,
        originalName: file.original_name,
        subject: file.subject,
        description: file.description,
        size: file.size,
        createdAt: new Date(file.created_at),
        url: file.file_url,
        mimeType: file.mime_type || 'application/octet-stream',
        uploadedBy: file.uploaded_by,
        visibility: file.visibility || 'private',
        storagePath: file.storage_path,
        timestamp: file.created_at,
        bucket_name: file.bucket_name
      }));
    } catch (error) {
      console.error('Error getting files:', error);
      throw error;
    }
  },

  // Delete a file
  deleteFile: async (file: UploadedFile): Promise<void> => {
    try {
      if (!file.id) throw new Error('File ID not provided');
      
      // Delete from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from(file.bucket_name || 'student_uploads')
        .remove([file.storagePath as string]);
        
      if (storageError) throw storageError;
      
      // Delete from Supabase Database
      const { error: dbError } = await supabase
        .from('uploads')
        .delete()
        .eq('id', file.id);
        
      if (dbError) throw dbError;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },
  
  // Get files for a specific subject
  getFilesBySubject: async (userId: string, subject: string): Promise<UploadedFile[]> => {
    try {
      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .eq('uploaded_by', userId)
        .eq('subject', subject)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data.map(file => ({
        id: file.id,
        userId: file.uploaded_by,
        filename: file.filename,
        fileType: file.file_type as 'paper' | 'notes' | 'quiz',
        fileURL: file.file_url,
        originalName: file.original_name,
        subject: file.subject,
        description: file.description,
        size: file.size,
        createdAt: new Date(file.created_at),
        url: file.file_url,
        mimeType: file.mime_type || 'application/octet-stream',
        uploadedBy: file.uploaded_by,
        visibility: file.visibility || 'private',
        storagePath: file.storage_path,
        timestamp: file.created_at,
        bucket_name: file.bucket_name
      }));
    } catch (error) {
      console.error('Error getting files by subject:', error);
      throw error;
    }
  }
};

// Also export the individual functions from the service object for direct imports
export const { getUserFiles, deleteFile } = fileService;

export default fileService;
