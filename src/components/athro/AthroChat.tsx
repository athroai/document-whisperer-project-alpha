
import React from 'react';
import { AthroProfileWrapper } from './AthroProfileWrapper';
import { Citation } from '@/types/citations';

// Define the Knowledge interface that was missing
export interface Knowledge {
  enhancedContext: string;
  hasKnowledgeResults: boolean;
  citations: Citation[];
}

interface AthroCharacterProps {
  fetchKnowledgeForQuery?: (query: string) => Promise<Knowledge>;
  isLoading?: boolean;
}

const AthroChat: React.FC<AthroCharacterProps> = ({ 
  fetchKnowledgeForQuery,
  isLoading = false
}) => {
  return (
    <div className="athro-chat">
      <div className="chat-header">
        <AthroProfileWrapper 
          name="Athro AI"
          subject="Mathematics"
        />
      </div>
      <div className="chat-messages">
        {isLoading ? (
          <div className="loading-message">Thinking...</div>
        ) : (
          <div className="welcome-message">
            Hello! I'm your Athro mentor. How can I help with your studies today?
          </div>
        )}
      </div>
    </div>
  );
};

export default AthroChat;
export { AthroChat };
