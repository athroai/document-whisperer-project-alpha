
import React, { useEffect } from 'react';
import { AthroCharacter, AthroMessage } from '@/types/athro';
import athroService from '@/services/athroService';
import { useStudentClass } from '@/contexts/StudentClassContext';
import { useAuth } from '@/contexts/AuthContext';
import AthroSessionFirestoreService from '@/services/firestore/athroSessionService';
import { getAthroById } from '@/config/athrosConfig';
import { useTranslation } from '@/hooks/useTranslation';
import { enhanceResponseWithKnowledge, shouldEnhanceWithKnowledge } from '@/services/athroServiceExtension';
import { enhanceMessageWithCitations } from '@/services/citationService';
import { Citation } from '@/types/citations';

interface AthroRouterProps {
  character: AthroCharacter;
  message: string;
  context?: Record<string, any>;
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
  const { language } = useTranslation();
  
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
        let enhancedContext: Record<string, any> = {
          ...context,
          promptPersona,
          preferredLanguage: language // Add the user's language preference
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
        let subjectContext: Record<string, any> = {};
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
        
        // Special handling for AthroWelsh when language is set to Welsh
        if (character.subject === 'Welsh' && language === 'cy') {
          enhancedContext.respondInWelsh = true;
        }
        
        // Check if the message would benefit from knowledge base enhancement
        let knowledgeContext = '';
        let hasKnowledgeResults = false;
        let knowledgeSearchResults = [];
        
        if (shouldEnhanceWithKnowledge(message)) {
          console.log(`[AthroRouter] Enhancing response with knowledge for: "${message.substring(0, 50)}..."`);
          
          // Get the subject in lowercase format for knowledge search
          const knowledgeSubject = character.subject.toLowerCase();
          
          // Enhance with knowledge
          const { enhancedContext: knowledgeEnhancement, hasKnowledgeResults: hasResults, searchResults } = 
            await enhanceResponseWithKnowledge(message, knowledgeSubject);
          
          knowledgeContext = knowledgeEnhancement;
          hasKnowledgeResults = hasResults;
          knowledgeSearchResults = searchResults || [];
          
          if (hasKnowledgeResults) {
            console.log('[AthroRouter] Successfully retrieved relevant knowledge');
          } else {
            console.log('[AthroRouter] No relevant knowledge found');
          }
        }
        
        // Add knowledge context to the enhanced context
        if (knowledgeContext) {
          enhancedContext.knowledgeContext = knowledgeContext;
        }
        
        // Use the athroService to generate a persona-driven response
        const response = await athroService.generateResponse(
          message,
          character.subject,
          character.examBoards[0],
          {
            ...subjectContext,
            ...enhancedContext,
            hasKnowledgeResults
          }
        );
        
        // For mock enrollments, add a note to the response
        let finalResponse = { ...response };
        if (isMockEnrollment && !response.content.includes('mock')) {
          finalResponse.content = `[Mock Session] ${response.content}`;
        }

        // Enhance the message with citations if knowledge results were found
        let citations: Citation[] = [];
        if (hasKnowledgeResults && knowledgeSearchResults.length > 0) {
          try {
            const { enhancedMessage, citations: messageCitations } = await enhanceMessageWithCitations(
              finalResponse.content,
              message,
              character.subject.toLowerCase()
            );
            
            // Add citations to the response
            if (messageCitations.length > 0) {
              console.log('[AthroRouter] Adding citations to response:', messageCitations.length);
              finalResponse.content = enhancedMessage;
              finalResponse.citations = messageCitations;
              citations = messageCitations;
            }
          } catch (citationError) {
            console.error('[AthroRouter] Error adding citations:', citationError);
          }
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
              finalResponse
            );
          } catch (err) {
            console.error('[AthroRouter] Error saving session to Firestore:', err);
          }
        }
        
        onResponse(finalResponse);
      } catch (error) {
        console.error('[AthroRouter] Error processing message:', error);
        
        const errorResponse: AthroMessage = {
          id: Date.now().toString(),
          senderId: character.id,
          content: language === 'cy' 
            ? "Mae gen i broblem yn prosesu hynny ar hyn o bryd. Allech chi roi cynnig arall arni?"
            : "I'm having trouble processing that right now. Could you try again?",
          timestamp: new Date().toISOString()
        };
        
        onResponse(errorResponse);
      }
    };
    
    processMessage();
  }, [character, message, context, onResponse, isMockEnrollment, state.user, language]);
  
  return null; // This is a logic component, not a UI component
};

export default AthroRouter;
