
import { Citation } from '@/types/citations';
import { KnowledgeSearchResult } from '@/types/knowledgeBase';
import { searchKnowledgeBase } from './knowledgeBaseService';

export interface KnowledgeResponse {
  enhancedContext: string;
  hasKnowledgeResults: boolean;
  citations: Citation[];
}

/**
 * Fetches relevant knowledge from the knowledge base for a given query
 */
export const fetchKnowledgeForQuery = async (
  query: string,
  subject?: string
): Promise<KnowledgeResponse> => {
  try {
    console.log(`Fetching knowledge for query: "${query}" in subject: ${subject || 'any'}`);
    
    // Search knowledge base for relevant results
    const results = await searchKnowledgeBase(query, subject);
    
    // If no results, return empty response
    if (!results || results.length === 0) {
      return {
        enhancedContext: '',
        hasKnowledgeResults: false,
        citations: []
      };
    }
    
    // Create context from results
    const enhancedContext = buildContextFromResults(results);
    
    // Create citations from results
    const citations = createCitationsFromResults(results);
    
    return {
      enhancedContext,
      hasKnowledgeResults: true,
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

/**
 * Build a context string from knowledge search results
 */
const buildContextFromResults = (results: KnowledgeSearchResult[]): string => {
  return results.map((result, index) => {
    const { chunk } = result;
    return `[${index + 1}] From "${chunk.sourceTitle}"${chunk.pageNumber ? ` (page ${chunk.pageNumber})` : ''}: ${chunk.content}`;
  }).join('\n\n');
};

/**
 * Create citation objects from knowledge search results
 */
const createCitationsFromResults = (results: KnowledgeSearchResult[]): Citation[] => {
  return results.map((result, index) => {
    const { chunk } = result;
    
    return {
      id: `cite_${Date.now()}_${index}`,
      label: `[${index + 1}]`,
      filename: chunk.sourceTitle,
      page: chunk.pageNumber,
      section: chunk.sectionTitle,
      highlight: chunk.content.substring(0, 150) + (chunk.content.length > 150 ? '...' : ''),
      timestamp: new Date().toISOString()
    };
  });
};

/**
 * Process uploaded files for knowledge base indexing
 */
export const processFilesForKnowledgeBase = async (
  files: File[],
  metadata: {
    userId: string;
    subject?: string;
    topic?: string;
    isPubliclyUsable?: boolean;
  }
): Promise<boolean> => {
  try {
    console.log(`Processing ${files.length} files for knowledge base`);
    
    // In a real implementation, this would:
    // 1. Parse each file based on type (PDF, DOCX, TXT)
    // 2. Chunk the content
    // 3. Add metadata
    // 4. Store in vector database
    
    // For now, we'll just log the files
    files.forEach(file => {
      console.log(`Would process: ${file.name} (${file.type}), subject: ${metadata.subject || 'unknown'}`);
    });
    
    return true;
  } catch (error) {
    console.error('Error processing files for knowledge base:', error);
    return false;
  }
};
