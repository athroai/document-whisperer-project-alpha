
import { searchKnowledgeBase } from './knowledgeBaseService';
import { KnowledgeSearchResult, VectorSearchOptions } from '@/types/knowledgeBase';

// Function to enhance AI responses with knowledge base content
export const enhanceResponseWithKnowledge = async (
  query: string,
  subject?: string
): Promise<{ enhancedContext: string, hasKnowledgeResults: boolean }> => {
  try {
    // Search knowledge base with appropriate options
    const searchOptions: VectorSearchOptions = {
      maxResults: 3,
      minSimilarity: 0.7,
      filterSubject: subject
    };
    
    // Search knowledge base for relevant chunks
    const relevantChunks: KnowledgeSearchResult[] = await searchKnowledgeBase(query, subject, 3);
    
    // If no relevant chunks found, return empty enhancement
    if (relevantChunks.length === 0) {
      return { 
        enhancedContext: '',
        hasKnowledgeResults: false
      };
    }
    
    // Build enhanced context from chunks
    let enhancedContext = "### Trusted Knowledge Context:\n\n";
    
    relevantChunks.forEach((result, index) => {
      const { chunk, similarity } = result;
      
      enhancedContext += `[Source ${index + 1}: "${chunk.sourceTitle}" - Relevance: ${Math.round(similarity * 100)}%]\n`;
      enhancedContext += chunk.content;
      enhancedContext += "\n\n";
    });
    
    // Add instruction for AI response
    enhancedContext += "Base your response primarily on the context provided above. If the context doesn't fully address the question, you may provide general knowledge but clearly indicate when you're doing so.\n\n";
    
    // Add attribution section
    enhancedContext += "Sources:\n";
    const uniqueSources = new Set();
    
    relevantChunks.forEach(result => {
      const { chunk } = result;
      const sourceInfo = `"${chunk.sourceTitle}"${chunk.topic ? ` (${chunk.topic})` : ''}`;
      uniqueSources.add(sourceInfo);
    });
    
    enhancedContext += Array.from(uniqueSources).join(", ");
    
    return {
      enhancedContext,
      hasKnowledgeResults: true
    };
    
  } catch (error) {
    console.error("Error enhancing response with knowledge:", error);
    return {
      enhancedContext: '',
      hasKnowledgeResults: false
    };
  }
};

// Function to determine if a query would benefit from knowledge base enhancement
export const shouldEnhanceWithKnowledge = (query: string): boolean => {
  // Query characteristics that suggest knowledge enhancement would be beneficial
  const knowledgePatterns = [
    // Long-form questions (typically more than 10 words)
    query.split(/\s+/).length > 10,
    
    // Questions about specific topics or concepts
    query.includes("explain"),
    query.includes("how does"),
    query.includes("what is"),
    query.includes("definition of"),
    query.includes("meaning of"),
    
    // Requests for examples, explanations or information
    query.includes("example"),
    query.includes("explain"),
    query.includes("information about"),
    query.includes("tell me about"),
    
    // Open-ended support requests
    query.includes("help me understand"),
    query.includes("can you elaborate"),
    query.includes("more information"),
    query.includes("need help with")
  ];
  
  // If any patterns match, suggest knowledge enhancement
  return knowledgePatterns.some(pattern => !!pattern);
};
