
import { Citation } from '@/types/citations';
import { searchKnowledgeBase } from './knowledgeBaseService';
import { KnowledgeSearchResult } from '@/types/knowledgeBase';
import { createCitationMarker } from '@/utils/citationUtils';

/**
 * Processes a message and adds citations based on knowledge search results
 */
export const processCitedMessage = async (
  message: string,
  subject: string,
  knowledgeResults: KnowledgeSearchResult[]
): Promise<{
  enhancedMessage: string;
  citations: Citation[];
}> => {
  const citations: Citation[] = [];
  let enhancedMessage = message;
  
  // Process knowledge results to create citations
  knowledgeResults.forEach((result, index) => {
    const { chunk, similarity } = result;
    const citationIndex = index + 1;
    const citationMarker = createCitationMarker(citationIndex);
    
    // Create citation object
    const citation: Citation = {
      id: `src_${Date.now()}_${citationIndex}`,
      label: citationMarker,
      filename: chunk.sourceTitle,
      section: chunk.sectionTitle,
      page: chunk.pageNumber,
      highlight: extractHighlight(chunk.content),
      timestamp: new Date().toISOString(),
    };
    
    citations.push(citation);
    
    // For a real implementation, the AI would need to be instructed to place citation markers
    // Here we're just appending citation references to the end of the message
    if (index === knowledgeResults.length - 1) {
      enhancedMessage += `\n\nReferences: ${citations.map(c => c.label).join(', ')}`;
    }
  });
  
  return {
    enhancedMessage,
    citations
  };
};

/**
 * Extract a relevant highlight from content
 */
const extractHighlight = (content: string): string => {
  // For simplicity, we'll just take the first 150 characters
  // In a real implementation, this could use NLP to find the most relevant section
  if (content.length <= 150) return content;
  return content.substring(0, 150) + '...';
};

/**
 * Enhances a message with citations from knowledge search results
 */
export const enhanceMessageWithCitations = async (
  message: string,
  query: string,
  subject?: string
): Promise<{
  enhancedMessage: string;
  citations: Citation[];
}> => {
  try {
    // Search knowledge base for relevant results
    const knowledgeResults = await searchKnowledgeBase(query, subject, 3);
    
    // If no knowledge results, return the original message without citations
    if (knowledgeResults.length === 0) {
      return {
        enhancedMessage: message,
        citations: []
      };
    }
    
    // Process the message with citations
    return processCitedMessage(message, subject || '', knowledgeResults);
  } catch (error) {
    console.error('Error enhancing message with citations:', error);
    return {
      enhancedMessage: message,
      citations: []
    };
  }
};
