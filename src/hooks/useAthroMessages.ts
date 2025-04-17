
import { useState, useEffect, useCallback, useRef } from 'react';
import { getOpenAIResponse } from '@/lib/openai';
import { buildSystemPrompt } from '@/utils/athroPrompts';
import { AthroCharacter, AthroMessage } from '@/types/athro';
import { toast } from '@/hooks/use-toast';

export function useAthroMessages() {
  const [messages, setMessages] = useState<AthroMessage[]>([]); 
  const [isTyping, setIsTyping] = useState(false);
  const activeRequests = useRef(new Set<string>());
  const messagesRef = useRef<AthroMessage[]>([]);
  
  useEffect(() => {
    messagesRef.current = messages;
    console.log('Messages updated:', messages.length);
  }, [messages]);
  
  // Set up event listener for custom messages
  useEffect(() => {
    const handleCustomMessage = (event: Event) => {
      const customEvent = event as CustomEvent<AthroMessage>;
      if (customEvent.detail) {
        setMessages(prev => [...prev, customEvent.detail]);
      }
    };
    
    document.addEventListener('athro-message', handleCustomMessage);
    
    return () => {
      document.removeEventListener('athro-message', handleCustomMessage);
    };
  }, []);

  const clearMessages = useCallback(() => {
    console.log('Clearing all messages');
    setMessages([]);
  }, []);

  const sendMessage = useCallback(async (content: string, activeCharacter?: AthroCharacter | null): Promise<AthroMessage | null> => {
    console.log('Sending message:', { 
      content, 
      characterName: activeCharacter?.name || 'No Character',
      currentMessageCount: messagesRef.current.length
    });

    if (!activeCharacter || !content.trim()) {
      console.warn('Cannot send message: No active character or empty content', {
        hasActiveCharacter: !!activeCharacter,
        contentLength: content.trim().length
      });
      return null;
    }

    const requestId = Date.now().toString();
    activeRequests.current.add(requestId);
    
    if (content.toLowerCase() === "welcome") {
      console.log('Skipping welcome message');
      activeRequests.current.delete(requestId);
      return null;
    }
    
    // Create user message object
    const userMessage: AthroMessage = {
      id: requestId,
      senderId: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    setIsTyping(true);
    
    try {
      // Make the API call to OpenAI
      const systemPrompt = buildSystemPrompt(activeCharacter);
      
      const response = await getOpenAIResponse({
        systemPrompt: systemPrompt,
        userMessage: content,
      });
      
      console.log('Response received', { 
        responseLength: response?.length || 0,
        responsePreview: response ? response.substring(0, 50) + '...' : 'Empty response'
      });
      
      if (!activeRequests.current.has(requestId)) {
        console.warn('Request was cancelled');
        return userMessage;
      }
      
      const athroResponse: AthroMessage = {
        id: (Date.now() + 1).toString(),
        senderId: activeCharacter.id,
        content: response || "I'm having trouble connecting right now. Could you try again in a moment?",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prevMessages => [...prevMessages, athroResponse]);
      
      return userMessage;
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      if (activeRequests.current.has(requestId)) {
        const errorMessage: AthroMessage = {
          id: (Date.now() + 1).toString(),
          senderId: activeCharacter.id,
          content: "I'm having some trouble connecting to my knowledge base. Could you try again in a moment?",
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }
      
      return null;
    } finally {
      activeRequests.current.delete(requestId);
      setIsTyping(false);
    }
  }, []);

  return { messages, isTyping, sendMessage, clearMessages };
}
