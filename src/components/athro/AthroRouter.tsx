
import React, { useEffect } from 'react';
import { AthroCharacter, AthroMessage } from '@/types/athro';
import athroService from '@/services/athroService';
import { useStudentClass } from '@/contexts/StudentClassContext';

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
  const { isMockEnrollment } = useStudentClass();
  
  useEffect(() => {
    const processMessage = async () => {
      try {
        console.log(`[AthroRouter] Processing message for ${character.name}: "${message}"`);
        
        // Add mock enrollment information to the context if needed
        if (isMockEnrollment) {
          console.log('[AthroRouter] Using mock enrollment context');
          context = {
            ...context,
            isMockEnrollment: true,
            mockClass: `Mock Class: ${character.subject}`
          };
        }
        
        // Get subject-specific context if available
        let subjectContext = {};
        if (character.subject === 'Languages' && context?.subjectSection) {
          subjectContext = { subjectSection: context.subjectSection };
          console.log(`[AthroRouter] Language context detected:`, context.subjectSection);
          
          // For languages, we want to use special language-specific responses
          if (['french', 'german', 'spanish'].includes(context.subjectSection)) {
            // Check if we should use language-specific generation
            if (!message.includes('past paper') && !message.match(/exam|test|quiz/i)) {
              const languageResponse = athroService.generateLanguageResponse(message, context.subjectSection);
              
              const aiMessage = {
                id: Date.now().toString(),
                senderId: character.id,
                content: languageResponse,
                timestamp: new Date().toISOString(),
              };
              
              onResponse(aiMessage);
              return;
            }
          }
        }
        
        if (character.subject === 'Science' && context?.subjectSection) {
          subjectContext = { subjectSection: context.subjectSection };
        }
        
        // Use the athroService directly instead of mockAthroResponse
        const response = await athroService.generateResponse(
          message,
          character.subject,
          character.examBoards[0],
          {
            ...subjectContext,
            ...(isMockEnrollment ? { isMockSession: true } : {})
          }
        );
        
        // For mock enrollments, add a note to the response
        if (isMockEnrollment && !response.content.includes('mock')) {
          response.content = `[Mock Session] ${response.content}`;
        }
        
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
  }, [character, message, context, onResponse, isMockEnrollment]);
  
  return null; // This is a logic component, not a UI component
};

export default AthroRouter;
