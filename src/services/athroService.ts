
import { AthroCharacterConfig, AthroPromptContext, AthroResponse } from '@/types/athroCharacter';
import { formatPrompt } from '@/config/athrosConfig';

// This is a placeholder service that would connect to your backend/API
export const generateAthroResponse = async (
  character: AthroCharacterConfig,
  message: string,
  context: AthroPromptContext
): Promise<AthroResponse> => {
  try {
    // This is a mock response - in production, this would call an API
    console.log(`[Athro] Generating response for ${character.name} with context:`, context);
    
    // Format the system prompt based on the character's template
    const systemPrompt = formatPrompt(character.promptTemplate, {
      tone: character.tone,
      currentTopic: context.currentTopic || 'general topics'
    });
    
    console.log(`[Athro] System prompt: ${systemPrompt}`);
    console.log(`[Athro] User message: ${message}`);
    
    // In a real implementation, this would call OpenAI or another API
    // For now, return a mock response
    return mockResponse(character, message, context);
  } catch (error) {
    console.error('Error generating Athro response:', error);
    return {
      message: "I'm having trouble processing that right now. Could you try again in a moment?"
    };
  }
};

// Mock response generator for development
const mockResponse = (
  character: AthroCharacterConfig,
  message: string,
  context: AthroPromptContext
): AthroResponse => {
  const lowerMessage = message.toLowerCase();
  
  // Check if the message is a greeting
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || message.length < 5) {
    return {
      message: `Hello! I'm ${character.name}, your ${character.subject} study mentor. How can I help you today with your studies?`,
      suggestedTopics: character.topics.slice(0, 3)
    };
  }
  
  // Check if the message is about a specific topic
  for (const topic of character.topics) {
    if (lowerMessage.includes(topic.toLowerCase())) {
      return {
        message: `Let's explore ${topic} together! This is an important topic in ${character.subject}. What specific aspect of ${topic} would you like to work on?`,
        suggestedTopics: [topic],
        confidence: context.confidenceScores?.[topic] || 5
      };
    }
  }
  
  // Generic response
  return {
    message: `That's an interesting question about ${character.subject}. To help you better, could you tell me what specific topic you're studying right now?`,
    suggestedTopics: character.topics.slice(0, 3),
    confidence: 5
  };
};

// Handle file references
export const getRelevantResources = (
  subject: string,
  userId: string,
  topic?: string
): string[] => {
  // This is a placeholder - in production, this would query your database
  console.log(`[Athro] Getting resources for ${subject}, topic: ${topic}`);
  return [
    `${subject} Study Guide`,
    `${topic || subject} Practice Questions`,
    `${subject} Key Concepts`
  ];
};

// Generate a contextual prompt for the specific Athro and user situation
export const buildPromptContext = (
  character: AthroCharacterConfig,
  userId: string,
  subjectData: any,
  currentTopic?: string
): AthroPromptContext => {
  return {
    studentName: "Student", // In production, fetch from user profile
    recentTopics: subjectData?.recentTopics || [],
    confidenceScores: subjectData?.confidenceScores || {},
    examBoard: "wjec", // Default or user preference
    currentTopic,
    recentQuizScores: subjectData?.quizScores || [],
    uploadedResources: [] // In production, fetch from file service
  };
};
