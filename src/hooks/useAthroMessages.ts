
import { useState, useEffect, useCallback, useRef } from 'react';
import { getOpenAIResponse } from '@/lib/openai';
import { buildSystemPrompt } from '@/utils/athroPrompts';
import { AthroCharacter, AthroMessage } from '@/types/athro';
import { toast } from '@/hooks/use-toast';

export function useAthroMessages() {
  const [messages, setMessages] = useState<AthroMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const activeRequests = useRef(new Set<string>());
  
  // For debugging
  useEffect(() => {
    console.log('Current messages:', messages);
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    console.log('Messages cleared');
  }, []);

  const sendMessage = useCallback(async (content: string, activeCharacter: AthroCharacter | null) => {
    if (!activeCharacter || !content.trim()) {
      console.log('Cannot send message: No active character or empty message');
      return;
    }

    // Generate a unique request ID to track this specific request
    const requestId = Date.now().toString();
    activeRequests.current.add(requestId);

    console.log(`Sending message to ${activeCharacter.name}:`, content);
    
    // Create and add user message to state immediately
    const userMessage: AthroMessage = {
      id: requestId,
      senderId: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    // Add the user message to the state immediately
    setMessages(prevMessages => [...prevMessages, userMessage]);
    console.log('Added user message:', userMessage);
    
    setIsTyping(true);
    
    try {
      // Note: In a production app, this key should be in an environment variable
      // and we should use a backend proxy for API calls
      const openAIApiKey = "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";
      
      const systemPrompt = buildSystemPrompt(activeCharacter);
      
      console.log('Calling OpenAI with system prompt:', systemPrompt);
      
      const response = await getOpenAIResponse({
        systemPrompt: systemPrompt,
        userMessage: content,
        apiKey: openAIApiKey
      });
      
      console.log('OpenAI Response received:', response);
      
      // Check if this request is still active (hasn't been cancelled)
      if (!activeRequests.current.has(requestId)) {
        console.log('Request was cancelled, not updating state');
        return;
      }
      
      if (!response) {
        throw new Error('Empty response from OpenAI');
      }
      
      // Create response message
      const athroResponse: AthroMessage = {
        id: (Date.now() + 1).toString(),
        senderId: activeCharacter.id,
        content: response,
        timestamp: new Date().toISOString(),
      };
      
      // Add the AI response to the messages
      setMessages(prevMessages => [...prevMessages, athroResponse]);
      console.log('Added AI response:', athroResponse);

    } catch (error) {
      console.error("Error getting Athro response:", error);
      
      // Check if this request is still active
      if (!activeRequests.current.has(requestId)) {
        console.log('Request was cancelled, not showing error');
        return;
      }
      
      // Add error message to chat
      const errorMessage: AthroMessage = {
        id: (Date.now() + 1).toString(),
        senderId: activeCharacter?.id || 'system',
        content: "I'm having trouble connecting right now. Could you try again in a moment?",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      
      // Show toast notification for better UX
      toast({
        title: "Connection Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Clean up this request ID
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
