
import React from 'react';
import { Citation, CitedMessage } from '@/types/citations';
import InlineCitation from '@/components/citations/InlineCitation';

/**
 * Parses text with citation markers like [1], [2] and returns React elements with citation components
 */
export const renderWithCitations = (
  content: string, 
  citations: Citation[],
  onCitationClick?: (citation: Citation) => void
): React.ReactNode[] => {
  if (!citations || citations.length === 0) {
    return [content];
  }

  // Create a regex pattern matching all citation labels
  const citationLabels = citations.map(c => c.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const pattern = new RegExp(`(${citationLabels})`, 'g');
  
  // Split the text by citation markers
  const parts = content.split(pattern);
  
  return parts.map((part, index) => {
    const citation = citations.find(c => c.label === part);
    
    if (citation) {
      return (
        <InlineCitation 
          key={`citation-${index}`}
          citation={citation} 
          onClick={() => onCitationClick?.(citation)}
        />
      );
    }
    
    return part;
  });
};

/**
 * Creates a citation marker [n] for a source
 */
export const createCitationMarker = (index: number): string => {
  return `[${index}]`;
};

/**
 * Extracts citations from a source file or knowledge chunk
 */
export const extractCitationsFromSource = (
  sourceFile: any, 
  query: string, 
  startIndex: number = 1
): Citation[] => {
  // Mock implementation - in a real app, this would extract relevant citations
  // from a source document based on the query
  const mockCitations: Citation[] = [];
  
  if (sourceFile) {
    mockCitations.push({
      id: `src_${Date.now()}_${startIndex}`,
      label: `[${startIndex}]`,
      filename: sourceFile.title || 'Unknown Source',
      page: sourceFile.page,
      section: sourceFile.section,
      highlight: sourceFile.highlight || 'Relevant content from source',
      timestamp: new Date().toISOString(),
      url: sourceFile.fileUrl
    });
  }
  
  return mockCitations;
};

/**
 * Stores citations in the conversation history
 */
export const storeCitationsInHistory = (
  messageId: string,
  citations: Citation[]
): void => {
  // Implementation would depend on how conversation history is stored
  console.log('Storing citations for message', messageId, citations);
  
  // This is where you would integrate with the conversation history storage
  // localStorage, IndexedDB, or backend storage
};
