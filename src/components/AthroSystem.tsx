
import React, { useEffect, useState } from 'react';
import { useAthro } from '../contexts/AthroContext';
import AthroBase from './athro/AthroBase';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useToast } from '@/hooks/use-toast';
import { checkFirestoreConnection } from '@/config/firebase';

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
  const [firestoreStatus, setFirestoreStatus] = useState<'loading' | 'connected' | 'offline' | 'error'>('loading');
  const { toast } = useToast();

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

  // Check Firestore connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setFirestoreStatus('loading');
        const status = await checkFirestoreConnection();
        setFirestoreStatus(status);
      } catch (error) {
        console.error("Error checking Firestore connection:", error);
        setFirestoreStatus(navigator.onLine ? 'error' : 'offline');
      }
    };

    checkConnection();

    // Add network status listeners
    const handleOnline = () => {
      console.log('[Network] Browser reports online status');
      toast({
        title: "Network Connected",
        description: "Your device is now online. Reconnecting to Firestore...",
        variant: "default"
      });
      checkConnection();
    };
    
    const handleOffline = () => {
      console.log('[Network] Browser reports offline status');
      setFirestoreStatus('offline');
      toast({
        title: "Network Disconnected",
        description: "Your device is offline. Working in local mode.",
        variant: "default"
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

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
