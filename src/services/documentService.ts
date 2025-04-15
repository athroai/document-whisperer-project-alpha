
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface DocumentUploadResult {
  id: string;
  filename: string;
  originalName: string;
  storagePath: string;
  fileType: string;
  mimeType: string;
  size: number;
}

export interface DocumentMetadata {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export const uploadDocumentForChat = async (
  file: File,
  characterId: string,
  sessionId: string = 'default-session'
): Promise<DocumentUploadResult | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }

    // Create path for the file: user_id/character_id/file_name
    const filePath = `${userId}/${characterId}/${fileName}`;
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('study_materials')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }

    // Store metadata in the database
    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        character_id: characterId,
        session_id: sessionId,
        filename: fileName,
        storage_path: filePath,
        file_type: fileExt || 'unknown',
        mime_type: file.type,
        size: file.size,
        original_name: file.name
      })
      .select('id')
      .single();

    if (documentError) {
      console.error('Error storing document metadata:', documentError);
      // If metadata storage fails, try to delete the uploaded file
      await supabase.storage.from('study_materials').remove([filePath]);
      throw documentError;
    }

    return {
      id: documentData.id,
      filename: fileName,
      originalName: file.name,
      storagePath: filePath,
      fileType: fileExt || 'unknown',
      mimeType: file.type,
      size: file.size
    };
  } catch (error) {
    console.error('Document upload failed:', error);
    return null;
  }
};

export const getDocumentsForCharacter = async (characterId: string): Promise<DocumentMetadata[]> => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      console.error('User not authenticated');
      return [];
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .eq('character_id', characterId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }

    const documents: DocumentMetadata[] = await Promise.all(
      data.map(async (doc) => {
        // Get URL for the file
        const { data: urlData } = await supabase.storage
          .from('study_materials')
          .createSignedUrl(doc.storage_path, 3600); // URL valid for 1 hour

        return {
          id: doc.id,
          name: doc.original_name,
          type: doc.file_type,
          url: urlData?.signedUrl || '',
          uploadedAt: doc.created_at
        };
      })
    );

    return documents;
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

export const linkDocumentToMessage = async (documentId: string, messageId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('message_documents')
      .insert({
        document_id: documentId,
        message_id: messageId
      });

    if (error) {
      console.error('Error linking document to message:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error linking document to message:', error);
    return false;
  }
};
