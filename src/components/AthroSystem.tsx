
import React, { useEffect, useState } from 'react';
import { useAthro } from '../contexts/AthroContext';
import AthroBase from './athro/AthroBase';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';

interface KnowledgeResponse {
  enhancedContext: string;
  hasKnowledgeResults: boolean;
  citations: any[];
}

const AthroSystem: React.FC = () => {
  const { isOpen, setIsOpen } = useAthro();
  const location = useLocation();
  const [isFloatingChat, setIsFloatingChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use hotkey to toggle Athro
  useHotkeys('alt+a', () => {
    setIsOpen(!isOpen);
  });

  // Check if we should render a floating chat or the full Athro experience
  useEffect(() => {
    // On pages like /athro/*, we don't need the floating button
    const isAthroPage = location.pathname.startsWith('/athro');
    setIsFloatingChat(!isAthroPage);
  }, [location]);

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

  // If we're on an Athro page, don't render the floating chat button
  if (!isFloatingChat) return <AthroBase />;
  
  return (
    <>
      <AthroBase />
      
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-lg"
        >
          <MessageCircle size={24} />
        </Button>
      )}
    </>
  );
};

export default AthroSystem;
