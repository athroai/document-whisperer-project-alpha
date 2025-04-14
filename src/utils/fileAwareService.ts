
import { Citation } from '@/types/citations';
import { Knowledge } from '@/components/athro/AthroChat';
import { UploadedFile } from "@/types/files";
import { searchKnowledgeBase } from "@/services/knowledgeBaseService";

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
    size: file.size, // Convert to number if needed
    mimeType: file.type,
    original_name: file.name,
  };

  return mappedFile;
};

/**
 * Fetch knowledge for a given query
 */
export const fetchKnowledgeForQuery = async (query: string): Promise<Knowledge> => {
  try {
    // Search the knowledge base for relevant content
    const searchResults = await searchKnowledgeBase(query, undefined, 3);
    
    // Determine if we have useful knowledge results
    const hasKnowledgeResults = searchResults.length > 0;
    
    // Extract context from search results
    let enhancedContext = '';
    if (hasKnowledgeResults) {
      enhancedContext = searchResults
        .map(result => result.chunk.content)
        .join('\n\n');
    }
    
    // Create citations from the search results
    const citations: Citation[] = searchResults.map((result, index) => {
      return {
        id: `cite-${Date.now()}-${index}`,
        label: `[${index + 1}]`,
        filename: result.chunk.sourceTitle || 'Unknown Source',
        page: Number(result.chunk.pageNumber || 0), // Convert to number
        section: result.chunk.sectionTitle,
        highlight: result.chunk.content.substring(0, 150) + '...',
        timestamp: new Date().toISOString()
      };
    });
    
    return {
      enhancedContext,
      hasKnowledgeResults,
      citations
    };
  } catch (error) {
    console.error('Error fetching knowledge:', error);
    return {
      enhancedContext: '',
      hasKnowledgeResults: false,
      citations: []
    };
  }
};

// Export other utility functions if needed
export default {
  fetchKnowledgeForQuery,
  mapFileToUploadedFile
};
