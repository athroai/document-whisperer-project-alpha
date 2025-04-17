
import { supabase } from '@/lib/supabase';

interface OpenAIRequestParams {
  systemPrompt: string;
  userMessage: string;
}

export async function getOpenAIResponse({
  systemPrompt,
  userMessage
}: OpenAIRequestParams): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY || 'sk-mock-key-for-development'}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      // For development mode, return a mock response
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock response in development mode');
        return generateMockResponse(userMessage);
      }
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    
    // In development, provide a mock response
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock response due to error');
      return generateMockResponse(userMessage);
    }
    
    throw error;
  }
}

function generateMockResponse(userMessage: string): string {
  // Basic mock responses for development
  const responses = [
    `I understand you're asking about "${userMessage.substring(0, 30)}...". This is a fascinating topic in GCSE studies.`,
    `That's a great question about "${userMessage.substring(0, 30)}...". Let me explain step by step.`,
    `When we look at "${userMessage.substring(0, 30)}..." in the context of GCSE curriculum, we need to consider several key points.`,
    `I'd be happy to help you with "${userMessage.substring(0, 30)}...". This concept is important for your exams.`,
    `Let's break down "${userMessage.substring(0, 30)}..." into simpler parts so it's easier to understand.`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)] + 
    '\n\nRemember this is a development environment response. In production, you would receive a proper educational answer from the AI mentor.';
}
