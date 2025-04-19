
import React, { useEffect } from 'react';
import { AthroCharacter, AthroMessage } from '@/types/athro';
import { getOpenAIResponse } from '@/lib/openai';
import { buildSystemPrompt } from '@/utils/athroPrompts';
import { toast } from '@/hooks/use-toast';

interface AthroRouterProps {
  character: AthroCharacter;
  message: string;
  context?: any;
  onResponse: (message: AthroMessage) => void;
  apiKey?: string; // Keep this for backward compatibility but we don't need it
}

const AthroRouter: React.FC<AthroRouterProps> = ({
  character,
  message,
  context,
  onResponse,
}) => {
  useEffect(() => {
    const processMessage = async () => {
      try {
        console.log(`[AthroRouter] Processing message for ${character.name}`);
        console.log('[AthroRouter] Character data:', character);
        
        // Skip processing welcome message
        if (message.toLowerCase() === "welcome") {
          console.log('[AthroRouter] Skipping welcome message');
          return;
        }
        
        // Build system prompt for the character
        const systemPrompt = buildSystemPrompt(character);
        console.log('[AthroRouter] System prompt built, length:', systemPrompt.length);
        
        // Get response from OpenAI
        const response = await getOpenAIResponse({
          systemPrompt,
          userMessage: message,
        });
        
        console.log('[AthroRouter] Received response, length:', response?.length || 0);
        
        // Send response back
        onResponse({
          id: Date.now().toString(),
          role: 'assistant',
          senderId: character.id,
          content: response,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('[AthroRouter] Error processing message:', error);
        
        // Check if this is an API key error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('API key')) {
          toast({
            title: "API Key Required",
            description: "Please set your OpenAI API key in the settings.",
            variant: "destructive",
          });
        }
        
        onResponse({
          id: Date.now().toString(),
          role: 'assistant',
          senderId: character.id,
          content: "I'm having trouble connecting to my knowledge base right now. Could you try again in a moment?",
          timestamp: new Date().toISOString()
        });
      }
    };
    
    processMessage();
  }, [character, message, onResponse]);
  
  return null; // This is a logic component, not a UI component
};

export default AthroRouter;
