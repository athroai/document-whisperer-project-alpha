
import React, { useState } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import AthroChat from './AthroChat';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KnowledgeResponse {
  enhancedContext: string;
  hasKnowledgeResults: boolean;
  citations: any[];
}

const AthroBase: React.FC = () => {
  const { isOpen, setIsOpen, activeCharacter } = useAthro();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClose = () => {
    setIsOpen(false);
  };
  
  // Mock function to fetch knowledge for a query
  const fetchKnowledgeForQuery = async (query: string): Promise<KnowledgeResponse> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would call your knowledge search service
      return {
        enhancedContext: 'Enhanced context from knowledge base',
        hasKnowledgeResults: Math.random() > 0.5, // Randomly have results or not for testing
        citations: []
      };
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white sm:rounded-lg overflow-hidden w-full h-[80vh] sm:h-[600px] sm:max-w-3xl sm:max-h-[80vh]">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 bg-blue-600 text-white">
            <h2 className="font-bold text-xl">
              {activeCharacter ? `Athro ${activeCharacter.subject}` : 'Athro AI'}
            </h2>
            <Button variant="ghost" size="icon" onClick={handleClose} className="text-white">
              <X size={24} />
            </Button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <AthroChat 
              fetchKnowledgeForQuery={fetchKnowledgeForQuery} 
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthroBase;
