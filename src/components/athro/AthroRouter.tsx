
import React from 'react';
import { AthroCharacter, AthroMessage } from '@/types/athro';
import { AthroCharacterConfig } from '@/types/athroCharacter';
import { getOpenAIResponse } from '@/lib/openai';
import { buildSystemPrompt } from '@/utils/athroPrompts';

interface AthroRouterProps {
  character: AthroCharacter;
  message: string;
  context?: any;
  onResponse: (message: AthroMessage) => void;
  apiKey?: string;
}

const AthroRouter: React.FC<AthroRouterProps> = ({
  character,
  message,
  context,
  onResponse,
  apiKey
}) => {
  // In a real implementation, this component would:
  // 1. Preprocess the message based on the character
  // 2. Call the appropriate API (OpenAI, MathPix, etc.)
  // 3. Format the response for the specific character
  // 4. Handle special rendering requirements (LaTeX, languages, etc.)
  
  React.useEffect(() => {
    const processMessage = async () => {
      try {
        console.log(`[AthroRouter] Processing message for ${character.name}`);
        
        if (!apiKey) {
          console.warn('[AthroRouter] No API key provided, using mock response');
          // Simulate API call with a timeout
          setTimeout(() => {
            const response: AthroMessage = {
              id: Date.now().toString(),
              senderId: character.id,
              content: generateMockResponse(message, character),
              timestamp: new Date().toISOString()
            };
            
            onResponse(response);
          }, 1000);
          return;
        }
        
        // Use real API call with provided key
        console.log('[AthroRouter] Using real OpenAI API');
        const systemPrompt = buildSystemPrompt(character);
        
        const response = await getOpenAIResponse({
          systemPrompt,
          userMessage: message,
          apiKey
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
  }, [character, message, onResponse, apiKey]);
  
  return null; // This is a logic component, not a UI component
};

// Mock response generator based on character and input
const generateMockResponse = (message: string, character: AthroCharacter): string => {
  const lowerMessage = message.toLowerCase();
  
  // Basic arithmetic handling for Math subject
  if (character.subject === 'Mathematics') {
    // Check for simple arithmetic operations
    if (/\d+\s*[\+\-\*\/]\s*\d+/.test(lowerMessage)) {
      // Check specifically for "2-1" pattern
      if (lowerMessage.includes('2-1')) {
        return "2-1 = 1. This is a simple subtraction. Would you like to try more complex problems?";
      }
      
      return "I can help with that calculation. Let's work through this step by step.";
    }
    
    if (lowerMessage.includes('equation') || lowerMessage.includes('solve')) {
      // Include LaTeX formatting for math
      return "Let's solve this step by step. If we have the equation:\n\n$x^2 + 3x - 4 = 0$\n\nWe can use the quadratic formula:\n\n$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$\n\nWould you like me to continue with the solution?";
    }
  }
  
  if (character.subject === 'Science') {
    if (lowerMessage.includes('atom') || lowerMessage.includes('element')) {
      return "The atom is the basic unit of matter. It consists of a nucleus (protons and neutrons) with electrons orbiting around it. The number of protons defines which element it is. Would you like to explore a specific element or learn more about atomic structure?";
    }
  }
  
  // Handle non-mathematical questions that might be personal
  if (lowerMessage.includes('old') || lowerMessage.includes('age')) {
    return "I'm here to help with your GCSE Mathematics studies. Let's focus on a specific math topic you'd like to explore or practice. Would you like to work on algebra, geometry, or something else?";
  }
  
  // Generic response
  return `I'm ${character.name}, your ${character.subject} mentor. How can I help you understand this topic better?`;
};

export default AthroRouter;
