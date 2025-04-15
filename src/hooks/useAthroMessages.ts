
import { useState, useEffect, useCallback, useRef } from 'react';
import { getOpenAIResponse } from '@/lib/openai';
import { buildSystemPrompt } from '@/utils/athroPrompts';
import { AthroCharacter, AthroMessage } from '@/types/athro';
import { toast } from '@/hooks/use-toast';

export function useAthroMessages() {
  const [messages, setMessages] = useState<AthroMessage[]>([]); // Initialize as empty array
  const [isTyping, setIsTyping] = useState(false);
  const activeRequests = useRef(new Set<string>());
  const initializedRef = useRef(false);
  const messagesRef = useRef<AthroMessage[]>([]);
  
  useEffect(() => {
    messagesRef.current = messages;
    console.log('💬 Messages updated:', messages.length);
  }, [messages]);
  
  useEffect(() => {
    if (!initializedRef.current) {
      console.log('🔄 useAthroMessages: Initial setup');
      initializedRef.current = true;
      // CRITICAL: No automatic welcome message should be sent here
      // Previous implementation may have had a message here
    }
    
    return () => {
      console.log('💭 useAthroMessages: Cleanup');
      activeRequests.current.clear();
    };
  }, []);

  const clearMessages = useCallback(() => {
    console.log('🧹 Clearing all messages');
    setMessages([]);
  }, []);

  const sendMessage = useCallback(async (content: string, activeCharacter?: AthroCharacter | null): Promise<AthroMessage | null> => {
    console.log('📨 Sending message:', { 
      content, 
      characterName: activeCharacter?.name || 'No Character',
      currentMessageCount: messagesRef.current.length
    });

    if (!activeCharacter || !content.trim()) {
      console.warn('❌ Cannot send message: No active character or empty content', {
        hasActiveCharacter: !!activeCharacter,
        contentLength: content.trim().length
      });
      return null;
    }

    const requestId = Date.now().toString();
    activeRequests.current.add(requestId);
    
    // Don't send welcome messages at all
    if (content.toLowerCase() === "welcome") {
      console.log('🚫 Skipping welcome message');
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
    
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, userMessage];
      console.log('✅ Adding user message', { 
        prevMessageCount: prevMessages.length, 
        newMessageCount: updatedMessages.length,
        newMessageContent: content 
      });
      return updatedMessages;
    });
    
    setIsTyping(true);
    
    try {
      // Make the API call to OpenAI
      const systemPrompt = buildSystemPrompt(activeCharacter);
      
      const response = await getOpenAIResponse({
        systemPrompt: systemPrompt,
        userMessage: content,
      });
      
      console.log('✨ Response received', { 
        responseLength: response?.length || 0,
        responsePreview: response ? response.substring(0, 50) + '...' : 'Empty response'
      });
      
      if (!activeRequests.current.has(requestId)) {
        console.warn('🚫 Request was cancelled');
        return userMessage;
      }
      
      const athroResponse: AthroMessage = {
        id: (Date.now() + 1).toString(),
        senderId: activeCharacter.id,
        content: response || "I'm having trouble connecting right now. Could you try again in a moment?",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, athroResponse];
        console.log('➕ Adding AI response', { 
          prevMessageCount: prevMessages.length, 
          newMessageCount: updatedMessages.length,
          responseContent: athroResponse.content.substring(0, 50) + '...' 
        });
        return updatedMessages;
      });

      return userMessage;

    } catch (error) {
      console.error("🔥 Error getting Athro response:", error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('📶 Network error detected - possibly CORS or connectivity issue');
        
        toast({
          title: "Network Error",
          description: "There seems to be a connection issue. Please check your internet connection.",
          variant: "destructive",
        });
      }
      
      const errorMessage: AthroMessage = {
        id: (Date.now() + 1).toString(),
        senderId: activeCharacter?.id || 'system',
        content: "I'm having trouble connecting right now. Could you try again in a moment.",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      
      toast({
        title: "Connection Issue",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });

      return userMessage;
    } finally {
      activeRequests.current.delete(requestId);
      setIsTyping(false);
    }
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    clearMessages,
    hasApiKey: true // Always return true since we have the project API key
  };
}
