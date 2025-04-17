
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
    console.log('Sending request to OpenAI API');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY || 'sk-mock-key-for-development'}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
    `I understand you're asking about "${userMessage.substring(0, 30)}...". This is a fascinating topic in GCSE studies! Let me explain this step by step...`,
    `That's a great question about "${userMessage.substring(0, 30)}...". When we look at this topic in the GCSE curriculum, we need to consider several key points.`,
    `"${userMessage.substring(0, 30)}..." is an important concept to understand for your exams. Here's how I would approach it:`,
    `I'd be happy to help you with "${userMessage.substring(0, 30)}...". This is exactly the kind of question that comes up in GCSE examinations.`,
    `Let's break down "${userMessage.substring(0, 30)}..." into more manageable parts so it's easier to understand for your GCSE studies.`
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // Add some subject-specific content to make it seem more realistic
  return `${randomResponse}

First, let's consider the main concepts involved. This is a key area in the GCSE curriculum that builds on your previous knowledge. 

I would suggest approaching this by:
1. Understanding the fundamental principles
2. Working through some example problems
3. Connecting it to related topics in the syllabus

Would you like me to explain any specific part of this topic in more detail? Or perhaps work through a practice question together?`;
}
