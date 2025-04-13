
import React, { useEffect } from 'react';
import { AthroCharacter, AthroMessage } from '@/types/athro';
import { AthroCharacterConfig } from '@/types/athroCharacter';
import { mockAthroResponse } from '@/services/athroService';

interface AthroRouterProps {
  character: AthroCharacter;
  message: string;
  context?: any;
  onResponse: (message: AthroMessage) => void;
}

const AthroRouter: React.FC<AthroRouterProps> = ({
  character,
  message,
  context,
  onResponse
}) => {
  useEffect(() => {
    const processMessage = async () => {
      try {
        console.log(`[AthroRouter] Processing message for ${character.name}: "${message}"`);
        
        // Get subject-specific context if available
        let subjectContext = {};
        if (character.subject === 'Languages' && context?.subjectSection) {
          subjectContext = { subjectSection: context.subjectSection };
        }
        
        if (character.subject === 'Science' && context?.subjectSection) {
          subjectContext = { subjectSection: context.subjectSection };
        }
        
        // Use the athroService instead of the mock implementation
        const response = await mockAthroResponse(
          message,
          character.subject,
          character.examBoards[0],
          subjectContext
        );
        
        onResponse(response);
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
  }, [character, message, context, onResponse]);
  
  return null; // This is a logic component, not a UI component
};

export default AthroRouter;
