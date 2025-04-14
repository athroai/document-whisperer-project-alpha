
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { uploadKnowledgeDocument } from '@/services/knowledgeBaseService';
import { UploadedDocument } from '@/types/knowledgeBase';

interface UseUploadKnowledgeOptions {
  userId: string;
  onUploadComplete?: (document: UploadedDocument) => void;
}

interface UploadDocumentParams {
  file: File;
  title: string;
  description?: string;
  subject?: string;
  topic?: string;
  isPubliclyUsable?: boolean;
}

export const useUploadKnowledge = ({ userId, onUploadComplete }: UseUploadKnowledgeOptions) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const uploadDocument = async (params: UploadDocumentParams) => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to upload documents.",
        variant: "destructive",
      });
      return null;
    }
    
    setUploading(true);
    setProgress(0);
    
    try {
      const document = await uploadKnowledgeDocument({
        file: params.file,
        title: params.title,
        description: params.description || '',
        subject: params.subject,
        uploadedBy: userId,
        isPubliclyUsable: params.isPubliclyUsable || false,
        topic: params.topic
      }, (progress) => {
        setProgress(progress);
      });
      
      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded and is being processed."
      });
      
      if (onUploadComplete) {
        onUploadComplete(document);
      }
      
      return document;
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your document.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };
  
  return {
    uploadDocument,
    uploading,
    progress,
    setProgress
  };
};

export default useUploadKnowledge;
