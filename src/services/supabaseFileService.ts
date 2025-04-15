
import { supabase, typedSupabase, ExtendedUpload, toExtendedUpload } from "@/integrations/supabase/client";
import { UploadedFile } from "@/types/files";

/**
 * Service for handling file operations with Supabase storage
 */
export const supabaseFileService = {
  /**
   * Upload a file to Supabase Storage
   */
  uploadFile: async (
    file: File, 
    userId: string, 
    options: { 
      subject: string;
      topic?: string;
      visibility?: 'private' | 'class-only' | 'public';
    },
    onProgress?: (progress: number) => void
  ): Promise<UploadedFile> => {
    try {
      const { subject, topic, visibility = 'private' } = options;
      const bucketName = 'student_uploads'; // Could be dynamic based on user role
      
      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${subject}/${fileName}`;
      
      // Start upload
      onProgress?.(10);
      
      // Upload to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (storageError) throw storageError;
      
      onProgress?.(50);
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      // Save to uploads table
      const { data: uploadData, error: dbError } = await supabase
        .from('uploads')
        .insert({
          filename: fileName,
          original_name: file.name,
          storage_path: filePath,
          file_url: publicUrlData?.publicUrl,
          bucket_name: bucketName,
          subject,
          topic: topic || null,
          visibility,
          mime_type: file.type,
          size: file.size,
          file_type: topic || 'general',
          uploaded_by: userId
        })
        .select()
        .single();
        
      if (dbError) throw dbError;
      
      onProgress?.(100);
      
      // Map to our UploadedFile type
      return {
        id: uploadData.id,
        uploadedBy: uploadData.uploaded_by,
        subject: uploadData.subject,
        fileType: uploadData.file_type || uploadData.mime_type,
        visibility: uploadData.visibility,
        filename: uploadData.filename,
        original_name: uploadData.original_name,
        storagePath: uploadData.storage_path,
        timestamp: uploadData.created_at,
        size: uploadData.size,
        mimeType: uploadData.mime_type,
        url: uploadData.file_url,
        bucket_name: bucketName // Add this line
      };
    } catch (error: any) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },
  
  /**
   * Get files for the current user
   */
  getUserFiles: async (userId: string): Promise<UploadedFile[]> => {
    try {
      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .eq('uploaded_by', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data.map(file => {
        const extendedFile = toExtendedUpload(file);
        return {
          id: file.id,
          uploadedBy: file.uploaded_by,
          subject: file.subject,
          fileType: file.file_type || file.mime_type,
          visibility: file.visibility,
          filename: file.filename,
          original_name: file.original_name,
          storagePath: file.storage_path,
          timestamp: file.created_at,
          size: file.size,
          mimeType: file.mime_type,
          url: file.file_url,
          bucket_name: extendedFile.bucket_name,
          file_url: file.file_url
        };
      });
    } catch (error: any) {
      console.error('Error fetching files:', error);
      throw error;
    }
  },
  
  /**
   * Get shared files for a specific subject
   */
  getSharedFiles: async (subject?: string): Promise<UploadedFile[]> => {
    try {
      let query = supabase
        .from('uploads')
        .select('*')
        .or('visibility.eq.public,visibility.eq.class-only')
        .order('created_at', { ascending: false });
        
      if (subject) {
        query = query.eq('subject', subject);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data.map(file => ({
        id: file.id,
        uploadedBy: file.uploaded_by,
        subject: file.subject,
        fileType: file.file_type || file.mime_type,
        visibility: file.visibility,
        filename: file.filename,
        original_name: file.original_name,
        storagePath: file.storage_path,
        timestamp: file.created_at,
        size: file.size,
        mimeType: file.mime_type,
        url: file.file_url,
        bucket_name: file.bucket_name,
        file_url: file.file_url
      }));
    } catch (error: any) {
      console.error('Error fetching shared files:', error);
      throw error;
    }
  },
  
  /**
   * Delete a file
   */
  deleteFile: async (file: UploadedFile): Promise<void> => {
    try {
      // First delete from storage
      const bucketName = file.bucket_name || 'student_uploads';
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([file.storagePath]);
        
      if (storageError) throw storageError;
      
      // Then delete from database
      const { error: dbError } = await supabase
        .from('uploads')
        .delete()
        .eq('id', file.id);
        
      if (dbError) throw dbError;
    } catch (error: any) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },
  
  /**
   * Update file metadata
   */
  updateFile: async (fileId: string, metadata: Partial<UploadedFile>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('uploads')
        .update({
          visibility: metadata.visibility,
          subject: metadata.subject,
          topic: metadata.topic || null,
          file_type: metadata.fileType
        })
        .eq('id', fileId);
        
      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating file:', error);
      throw error;
    }
  }
};

export default supabaseFileService;
