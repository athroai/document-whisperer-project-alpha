
import { Citation, CitedMessage } from '@/types/citations';
import { UploadedFile } from '@/types/files';
import { getFilesBySubject, getRecentFiles } from '@/services/fileService';
import { searchKnowledgeBase } from '@/services/knowledgeBaseService';
import { KnowledgeSearchResult } from '@/types/knowledgeBase';
import { enhanceMessageWithCitations } from '@/services/citationService';

/**
 * Process a user message and return an AI response with citations
 */
export const processMessageWithFileContext = async (
  message: string,
  subject: string,
  userId: string
): Promise<CitedMessage> => {
  try {
    // Step 1: Get relevant files for this subject
    const subjectFiles = await getFilesBySubject(subject);
    
    // Step 2: Get user's recent files
    const userFiles = await getRecentFiles(userId);
    
    // Step 3: Combine and deduplicate files
    const allFiles = [...subjectFiles];
    userFiles.forEach(file => {
      if (!allFiles.some(f => f.id === file.id)) {
        allFiles.push(file);
      }
    });
    
    // Step 4: Extract information from the message to enhance search context
    const searchContext = generateSearchContext(message);
    
    // Step 5: Get enhanced response with citations
    const { enhancedMessage, citations } = await enhanceMessageWithCitations(
      message,
      searchContext,
      subject
    );
    
    // Return the cited message
    return {
      content: enhancedMessage,
      citations
    };
  } catch (error) {
    console.error('Error processing message with file context:', error);
    return {
      content: "I'm sorry, I couldn't process your request with file context. Please try again.",
      citations: []
    };
  }
};

/**
 * Generate a search context from a user message
 */
const generateSearchContext = (message: string): string => {
  // In a more advanced implementation, this would use NLP to extract key terms,
  // identify the question intent, etc.
  
  // For now, we'll just clean up the message a bit
  const cleanedMessage = message
    .replace(/[^\w\s?]/g, '') // Remove special characters except question marks
    .trim();
    
  return cleanedMessage;
};

/**
 * Create citations from knowledge search results
 */
export const createCitationsFromKnowledgeResults = (
  results: KnowledgeSearchResult[]
): Citation[] => {
  return results.map((result, index) => {
    const { chunk, similarity } = result;
    
    return {
      id: `cite_${Date.now()}_${index}`,
      label: `[${index + 1}]`,
      filename: chunk.sourceTitle,
      page: chunk.pageNumber,
      section: chunk.sectionTitle,
      highlight: extractRelevantHighlight(chunk.content),
      timestamp: new Date().toISOString()
    };
  });
};

/**
 * Extract a relevant highlight from content
 */
const extractRelevantHighlight = (content: string): string => {
  // For simplicity, we'll just take the first 150 characters
  // In a real implementation, this could use NLP to find the most relevant section
  if (content.length <= 150) return content;
  return content.substring(0, 150) + '...';
};
