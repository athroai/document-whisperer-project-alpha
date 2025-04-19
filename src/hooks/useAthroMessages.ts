
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
        console.log('Custom message received:', customEvent.detail);
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
      role: 'user',
      senderId: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    // Update messages with user's message first
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Set typing indicator
    setIsTyping(true);
    
    try {
      // Build the system prompt for this character
      const systemPrompt = buildSystemPrompt(activeCharacter);
      console.log('System prompt built, length:', systemPrompt.length);
      
      // Make the API call to OpenAI
      const response = await getOpenAIResponse({
        systemPrompt: systemPrompt,
        userMessage: content,
      });
      
      console.log('Response received', { 
        responseLength: response?.length || 0,
        responsePreview: response ? response.substring(0, 50) + '...' : 'Empty response'
      });
      
      // Check if this request was cancelled
      if (!activeRequests.current.has(requestId)) {
        console.warn('Request was cancelled');
        return userMessage;
      }
      
      // Create Athro response message
      const athroResponse: AthroMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        senderId: activeCharacter.id,
        content: response || "I'm having trouble connecting right now. Could you try again in a moment?",
        timestamp: new Date().toISOString(),
      };
      
      // Update messages with Athro's response
      setMessages(prevMessages => [...prevMessages, athroResponse]);
      
      return userMessage;
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Only show error message if request wasn't cancelled
      if (activeRequests.current.has(requestId)) {
        const errorMessage: AthroMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          senderId: activeCharacter.id,
          content: "I'm having some trouble connecting to my knowledge base. Could you try again in a moment?",
          timestamp: new Date().toISOString(),
        };
        
        // Add error message to conversation
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }
      
      return null;
    } finally {
      // Clean up regardless of success or failure
      activeRequests.current.delete(requestId);
      setIsTyping(false);
    }
  }, []);

  return { messages, isTyping, sendMessage, clearMessages };
}
