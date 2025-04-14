import { UploadedFile } from "@/types/files";

export const mapFileToUploadedFile = (file: File, uploadedBy: string, subject: string): UploadedFile => {
  // Ensure required properties are present
  if (!file || !uploadedBy || !subject) {
    throw new Error("Missing required properties to map file");
  }

  // Basic type checking
  if (typeof uploadedBy !== 'string' || typeof subject !== 'string') {
    throw new Error("uploadedBy and subject must be strings");
  }

  const timestamp = new Date().toISOString();

  const mappedFile: UploadedFile = {
    id: `file-${timestamp}-${file.name}`, // Unique ID
    uploadedBy: uploadedBy,
    subject: subject,
    fileType: file.type, // MIME type
    visibility: 'private', // Default visibility
    filename: file.name,
    storagePath: `uploads/${uploadedBy}/${file.name}`, // Example path
    timestamp: timestamp,
    size: file.size,
    mimeType: file.type,
    original_name: file.name,
  };

  return mappedFile;
};
