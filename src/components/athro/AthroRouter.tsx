
import React, { useEffect } from 'react';
import { AthroCharacter, AthroMessage } from '@/types/athro';
import { getOpenAIResponse } from '@/lib/openai';
import { buildSystemPrompt } from '@/utils/athroPrompts';

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
  React.useEffect(() => {
    const processMessage = async () => {
      try {
        console.log(`[AthroRouter] Processing message for ${character.name}`);
        
        // Use real API call with project API key
        console.log('[AthroRouter] Using OpenAI API');
        const systemPrompt = buildSystemPrompt(character);
        
        const response = await getOpenAIResponse({
          systemPrompt,
          userMessage: message,
        });
        
        onResponse({
          id: Date.now().toString(),
          senderId: character.id,
          content: response,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('[AthroRouter] Error processing message:', error);
        
        onResponse({
          id: Date.now().toString(),
          senderId: character.id,
          content: "I'm having trouble processing that right now. Could you try again?",
          timestamp: new Date().toISOString()
        });
      }
    };
    
    processMessage();
  }, [character, message, onResponse]);
  
  return null; // This is a logic component, not a UI component
};

export default AthroRouter;
