
import type { Database } from "@/integrations/supabase/types";

export interface ExtendedUpload extends Database['public']['Tables']['uploads']['Row'] {
  bucket_name?: string;
  file_URL?: string;
  fileURL?: string;
  url?: string;
}

// Function to convert database record to extended upload type
export const toExtendedUpload = (data: Database['public']['Tables']['uploads']['Row']): ExtendedUpload => {
  return {
    ...data,
    bucket_name: 'student_uploads', // Default bucket name
    fileURL: data.file_url,
    url: data.file_url,
  };
};
