
import React, { useState } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MessageCircle, CloudOff, AlertCircle } from 'lucide-react';
import AthroChat from './athro/AthroChat';
import { Badge } from './ui/badge';
import { Citation } from '@/types/citations';
import { searchKnowledgeBase } from '@/services/knowledgeBaseService';
import { createCitationsFromKnowledgeResults } from '@/services/fileAwareAiService';

const AthroSystem: React.FC = () => {
  const { activeCharacter, sendMessage, firestoreStatus } = useAthro();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch knowledge for a given query
  const fetchKnowledgeForQuery = async (query: string) => {
    setIsLoading(true);
    try {
      if (!activeCharacter) {
        return {
          enhancedContext: '',
          hasKnowledgeResults: false,
          citations: []
        };
      }
      
      const subject = activeCharacter.subject.toLowerCase();
      const searchResults = await searchKnowledgeBase(query, subject);
      
      if (searchResults.length === 0) {
        return {
          enhancedContext: '',
          hasKnowledgeResults: false,
          citations: []
        };
      }
      
      // Create citations from the search results
      const citations = createCitationsFromKnowledgeResults(searchResults);
      
      // Create enhanced context from the search results
      const enhancedContext = searchResults
        .map(result => result.chunk.content)
        .join('\n\n');
      
      return {
        enhancedContext,
        hasKnowledgeResults: true,
        citations
      };
    } catch (error) {
      console.error('Error fetching knowledge for query:', error);
      return {
        enhancedContext: '',
        hasKnowledgeResults: false,
        citations: []
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <div className="relative">
            <Button 
              size="icon" 
              className="h-12 w-12 rounded-full shadow-lg"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="sr-only">Open Athro Chat</span>
            </Button>
            
            {firestoreStatus === 'offline' && (
              <Badge 
                variant="outline" 
                className="absolute -top-2 -right-2 bg-yellow-50 text-yellow-800 border-yellow-200 flex items-center"
              >
                <CloudOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
            
            {firestoreStatus === 'error' && (
              <Badge 
                variant="outline" 
                className="absolute -top-2 -right-2 bg-red-50 text-red-800 border-red-200 flex items-center"
              >
                <AlertCircle className="h-3 w-3 mr-1" />
                Error
              </Badge>
            )}
          </div>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 mr-2 rounded-full overflow-hidden">
                  <img 
                    src={activeCharacter?.avatarUrl || '/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png'} 
                    alt={activeCharacter?.name || 'Athro AI'} 
                    className="h-full w-full object-cover"
                  />
                </div>
                Chat with {activeCharacter?.name || 'Athro AI'}
              </div>
              
              {firestoreStatus === 'offline' && (
                <Badge 
                  variant="outline" 
                  className="bg-yellow-50 text-yellow-800 border-yellow-200 flex items-center gap-1"
                >
                  <CloudOff className="h-3 w-3" /> Offline Mode
                </Badge>
              )}
              
              {firestoreStatus === 'error' && (
                <Badge 
                  variant="outline" 
                  className="bg-red-50 text-red-800 border-red-200 flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" /> Sync Error
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100vh-80px)]">
            <AthroChat 
              fetchKnowledgeForQuery={fetchKnowledgeForQuery} 
              isLoading={isLoading} 
              isCompactMode={true} 
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AthroSystem;
