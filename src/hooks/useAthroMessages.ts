
import { useState, useEffect } from 'react';
import { getOpenAIResponse } from '@/lib/openai';
import { buildSystemPrompt } from '@/utils/athroPrompts';
import { AthroCharacter, AthroMessage } from '@/types/athro';

export function useAthroMessages() {
  const [messages, setMessages] = useState<AthroMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // For debugging
  useEffect(() => {
    console.log('Current messages:', messages);
  }, [messages]);

  const sendMessage = async (content: string, activeCharacter: AthroCharacter | null) => {
    if (!activeCharacter || !content.trim()) {
      console.log('Cannot send message: No active character or empty message');
      return;
    }

    console.log(`Sending message to ${activeCharacter.name}:`, content);
    
    const userMessage: AthroMessage = {
      id: Date.now().toString(),
      senderId: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    
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
      
      if (!response) {
        throw new Error('Empty response from OpenAI');
      }
      
      const athroResponse: AthroMessage = {
        id: (Date.now() + 1).toString(),
        senderId: activeCharacter.id,
        content: response,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, athroResponse]);
    } catch (error) {
      console.error("Error getting Athro response:", error);
      
      const errorMessage: AthroMessage = {
        id: (Date.now() + 1).toString(),
        senderId: activeCharacter?.id || 'system',
        content: "I'm having trouble connecting right now. Could you try again in a moment?",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isTyping,
    sendMessage,
    clearMessages
  };
}
