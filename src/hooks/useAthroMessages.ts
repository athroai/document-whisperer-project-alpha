
import { useState, useEffect, useCallback, useRef } from 'react';
import { getOpenAIResponse } from '@/lib/openai';
import { buildSystemPrompt } from '@/utils/athroPrompts';
import { AthroCharacter, AthroMessage } from '@/types/athro';
import { toast } from '@/hooks/use-toast';

export function useAthroMessages() {
  const [messages, setMessages] = useState<AthroMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const activeRequests = useRef(new Set<string>());
  const initializedRef = useRef(false);
  const messagesRef = useRef<AthroMessage[]>([]);
  
  // For storing the API key - in production this would be securely managed
  const [openAIApiKey, setOpenAIApiKey] = useState<string>("");
  const [adminApiKey, setAdminApiKey] = useState<string | null>(null);
  
  useEffect(() => {
    messagesRef.current = messages;
    console.log('💬 Messages updated:', messages.length);
  }, [messages]);
  
  useEffect(() => {
    if (!initializedRef.current) {
      console.log('🔄 useAthroMessages: Initial setup');
      initializedRef.current = true;
      
      // Check for admin API key first
      const adminKey = localStorage.getItem('athro_admin_openai_key');
      if (adminKey) {
        console.log('🔑 Admin API key found');
        setAdminApiKey(adminKey);
      } else {
        // If no admin key, look for user-specific stored key
        const storedApiKey = localStorage.getItem('openai_api_key');
        if (storedApiKey) {
          setOpenAIApiKey(storedApiKey);
          console.log('🔑 Loaded user API key');
        }
      }
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

  // Function to set API key (will be used by an input in StudySessionPage)
  const setApiKey = useCallback((key: string) => {
    setOpenAIApiKey(key);
    // Store in localStorage for persistence
    localStorage.setItem('openai_api_key', key);
    console.log('🔑 API key updated and stored');
  }, []);

  const sendMessage = useCallback(async (content: string, activeCharacter?: AthroCharacter | null) => {
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
      return;
    }
    
    // Check if we have either an admin key or user key
    const effectiveApiKey = adminApiKey || openAIApiKey;
    if (!effectiveApiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to continue.",
        variant: "destructive",
      });
      return;
    }

    const requestId = Date.now().toString();
    activeRequests.current.add(requestId);
    
    // Add user message to chat
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
      const systemPrompt = buildSystemPrompt(activeCharacter);
      console.log('🤖 System prompt built:', { 
        characterName: activeCharacter.name, 
        systemPromptLength: systemPrompt.length,
        promptStart: systemPrompt.substring(0, 50) + '...'
      });

      console.log('🌐 Network status before API call:', navigator.onLine ? 'Online' : 'Offline');
      
      // Make the actual API call to OpenAI
      const response = await getOpenAIResponse({
        systemPrompt: systemPrompt,
        userMessage: content,
        apiKey: effectiveApiKey
      });
      
      console.log('✨ Response received', { 
        responseLength: response?.length || 0,
        responsePreview: response ? response.substring(0, 50) + '...' : 'Empty response'
      });
      
      if (!activeRequests.current.has(requestId)) {
        console.warn('🚫 Request was cancelled');
        return;
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
    } finally {
      activeRequests.current.delete(requestId);
      setIsTyping(false);
    }
  }, [adminApiKey, openAIApiKey]);

  return {
    messages,
    isTyping,
    sendMessage,
    clearMessages,
    setApiKey,
    hasApiKey: !!adminApiKey || !!openAIApiKey
  };
}
