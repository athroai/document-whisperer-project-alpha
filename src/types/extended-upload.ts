
import type { Database } from "@/integrations/supabase/types";

// Define the base type from Supabase schema
type UploadRow = Database['public']['Tables']['uploads']['Row'];

// Create ExtendedUpload using type intersection instead of extends
export interface ExtendedUpload {
  id: string;
  created_at?: string | null;
  description?: string | null;
  file_type?: string | null;
  file_url?: string | null;
  filename?: string | null;
  mime_type?: string | null;
  original_name?: string | null;
  size?: number | null;
  storage_path?: string | null;
  subject?: string | null;
  uploaded_by?: string | null;
  visibility?: string | null;
  
  // Extended properties
  bucket_name?: string;
  file_URL?: string;
  fileURL?: string;
  url?: string;
}

// Function to convert database record to extended upload type
export const toExtendedUpload = (data: UploadRow): ExtendedUpload => {
  return {
    ...data,
    bucket_name: 'student_uploads', // Default bucket name
    fileURL: data.file_url,
    url: data.file_url,
  };
};
