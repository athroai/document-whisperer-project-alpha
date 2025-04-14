
import React, { useState, useEffect } from 'react';
import { AthroMessage, AthroCharacter } from '@/types/athro';
import CitedMessageDisplay from '@/components/citations/CitedMessageDisplay';
import { Citation } from '@/types/citations';
import CitationSidebar from '@/components/citations/CitationSidebar';

interface CitedAthroChatProps {
  messages: AthroMessage[];
  character: AthroCharacter;
  onSendMessage: (message: string) => void;
}

const CitedAthroChat: React.FC<CitedAthroChatProps> = ({ messages, character, onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [allCitations, setAllCitations] = useState<Citation[]>([]);
  
  // Collect all unique citations from messages
  useEffect(() => {
    const citationMap = new Map<string, Citation>();
    
    messages.forEach(message => {
      if (message.citations && message.citations.length > 0) {
        message.citations.forEach(citation => {
          // Use citation ID as key to ensure uniqueness
          citationMap.set(citation.id, citation);
        });
      }
    });
    
    setAllCitations(Array.from(citationMap.values()));
  }, [messages]);
  
  const handleCitationClick = (citation: Citation) => {
    setSelectedCitation(citation);
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };
  
  return (
    <div className="flex h-full bg-gray-50 rounded-lg overflow-hidden">
      {/* Main chat area */}
      <div className="flex flex-col flex-1">
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {character.imageUrl && (
              <div className="h-10 w-10 rounded-full overflow-hidden">
                <img 
                  src={character.imageUrl} 
                  alt={character.name} 
                  className="h-full w-full object-cover" 
                />
              </div>
            )}
            <div>
              <h3 className="font-semibold">{character.name}</h3>
              <p className="text-sm text-gray-500">{character.subject} Mentor</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => {
            const isAthro = message.senderId === character.id;
            
            return (
              <div 
                key={message.id}
                className={`flex ${isAthro ? 'justify-start' : 'justify-end'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    isAthro 
                      ? 'bg-white border border-gray-200' 
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {isAthro && message.citations ? (
                    <CitedMessageDisplay 
                      message={{
                        content: message.content,
                        citations: message.citations
                      }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ask your question..."
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
      
      {/* Citation sidebar - only show when there are citations */}
      {allCitations.length > 0 && (
        <CitationSidebar 
          citations={allCitations}
          onCitationClick={handleCitationClick}
        />
      )}
    </div>
  );
};

export default CitedAthroChat;
