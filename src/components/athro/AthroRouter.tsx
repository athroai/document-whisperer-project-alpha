
import React, { useEffect } from 'react';
import { AthroCharacter, AthroMessage } from '@/types/athro';
import athroService from '@/services/athroService';
import { useStudentClass } from '@/contexts/StudentClassContext';
import { useAuth } from '@/contexts/AuthContext';
import AthroSessionFirestoreService from '@/services/firestore/athroSessionService';
import { getAthroById } from '@/config/athrosConfig';

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
  const { state } = useAuth();
  
  useEffect(() => {
    const processMessage = async () => {
      try {
        console.log(`[AthroRouter] Processing message for ${character.name}: "${message}"`);
        
        // Get the full character config to access promptPersona
        const characterConfig = getAthroById(character.id);
        if (!characterConfig) {
          throw new Error(`Character configuration not found for ID: ${character.id}`);
        }
        
        const promptPersona = characterConfig.promptPersona || 
          `You are ${character.name}, a mentor for GCSE students specializing in ${character.subject}.`;
        
        console.log(`[AthroRouter] Using prompt persona: ${promptPersona.substring(0, 50)}...`);
        
        // Add mock enrollment information to the context if needed
        let enhancedContext = {
          ...context,
          promptPersona
        };
        
        if (isMockEnrollment) {
          console.log('[AthroRouter] Using mock enrollment context');
          enhancedContext = {
            ...enhancedContext,
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
              
              // If logged in, try to save the message to Firestore
              if (state.user?.id) {
                try {
                  AthroSessionFirestoreService.addMessage(state.user.id, character.subject, aiMessage);
                } catch (err) {
                  console.error('[AthroRouter] Error saving message to Firestore:', err);
                }
              }
              
              onResponse(aiMessage);
              return;
            }
          }
        }
        
        if (character.subject === 'Science' && context?.subjectSection) {
          subjectContext = { subjectSection: context.subjectSection };
        }
        
        // Use the athroService to generate a persona-driven response
        const response = await athroService.generateResponse(
          message,
          character.subject,
          character.examBoards[0],
          {
            ...subjectContext,
            ...enhancedContext
          }
        );
        
        // For mock enrollments, add a note to the response
        if (isMockEnrollment && !response.content.includes('mock')) {
          response.content = `[Mock Session] ${response.content}`;
        }
        
        // If logged in, try to save the message to Firestore
        if (state.user?.id) {
          try {
            // Save the user's message first
            await AthroSessionFirestoreService.addMessage(
              state.user.id, 
              character.subject,
              {
                id: Date.now().toString(),
                senderId: 'user',
                content: message,
                timestamp: new Date().toISOString()
              }
            );
            
            // Then save the AI's response
            await AthroSessionFirestoreService.addMessage(
              state.user.id, 
              character.subject, 
              response
            );
          } catch (err) {
            console.error('[AthroRouter] Error saving session to Firestore:', err);
          }
        }
        
        onResponse(response);
      } catch (error) {
        console.error('[AthroRouter] Error processing message:', error);
        
        const errorResponse = {
          id: Date.now().toString(),
          senderId: character.id,
          content: "I'm having trouble processing that right now. Could you try again?",
          timestamp: new Date().toISOString()
        };
        
        onResponse(errorResponse);
      }
    };
    
    processMessage();
  }, [character, message, context, onResponse, isMockEnrollment, state.user]);
  
  return null; // This is a logic component, not a UI component
};

export default AthroRouter;
