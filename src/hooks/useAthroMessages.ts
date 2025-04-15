
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
  
  useEffect(() => {
    console.log('🔍 useAthroMessages: Initial Message State', { 
      messageCount: messages.length, 
      isTyping, 
      initialized: initializedRef.current 
    });
  }, [messages, isTyping]);

  const clearMessages = useCallback(() => {
    console.log('🧹 Clearing all messages');
    setMessages([]);
  }, []);

  const sendMessage = useCallback(async (content: string, activeCharacter: AthroCharacter | null) => {
    console.log('📨 Sending message:', { 
      content, 
      characterName: activeCharacter?.name || 'No Character' 
    });

    if (!activeCharacter || !content.trim()) {
      console.warn('❌ Cannot send message: Invalid parameters');
      return;
    }

    const requestId = Date.now().toString();
    activeRequests.current.add(requestId);
    
    const userMessage: AthroMessage = {
      id: requestId,
      senderId: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prevMessages => {
      console.log('✅ Adding user message', { 
        prevMessageCount: prevMessages.length, 
        newMessageContent: content 
      });
      return [...prevMessages, userMessage];
    });
    
    setIsTyping(true);
    
    try {
      const openAIApiKey = "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";
      
      const systemPrompt = buildSystemPrompt(activeCharacter);
      
      console.log('🤖 Calling OpenAI', { 
        characterName: activeCharacter.name, 
        systemPromptLength: systemPrompt.length 
      });
      
      const response = await getOpenAIResponse({
        systemPrompt: systemPrompt,
        userMessage: content,
        apiKey: openAIApiKey
      });
      
      console.log('✨ Response received', { 
        responseLength: response?.length || 0 
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
        console.log('➕ Adding AI response', { 
          prevMessageCount: prevMessages.length, 
          responseContent: athroResponse.content 
        });
        return [...prevMessages, athroResponse];
      });

    } catch (error) {
      console.error("🔥 Error getting Athro response:", error);
      
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
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    clearMessages
  };
}
