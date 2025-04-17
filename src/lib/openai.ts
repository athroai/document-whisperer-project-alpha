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
    
    // Define the new API key
    const newApiKey = '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';
    
    // Try Supabase secrets first
    try {
      const { data } = await supabase.functions.invoke('get-secret', {
        body: { name: 'OPENAI_API_KEY' }
      });
      
      if (data?.secret) {
        console.log('Using API key from Supabase secrets');
        return await callOpenAI(data.secret, systemPrompt, userMessage);
      }
    } catch (secretError) {
      console.log('Could not retrieve secret from Supabase, falling back', secretError);
    }
    
    // Fall back to new API key
    if (newApiKey) {
      console.log('Using new provided API key');
      return await callOpenAI(newApiKey, systemPrompt, userMessage);
    }
    
    // Fallback to environment variable
    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (envApiKey) {
      console.log('Using API key from environment variable');
      return await callOpenAI(envApiKey, systemPrompt, userMessage);
    }
    
    // If we're in development, use mock response
    if (import.meta.env.DEV) {
      console.warn('No API key found, using mock response in development mode');
      return generateMockResponse(userMessage);
    }
    
    throw new Error('No OpenAI API key available');
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    
    // In development, provide a mock response
    if (import.meta.env.DEV) {
      console.warn('Using mock response due to error');
      return generateMockResponse(userMessage);
    }
    
    throw error;
  }
}

// Helper function to make OpenAI API call
async function callOpenAI(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
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
    console.warn(`OpenAI API error: ${response.status}`);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function generateMockResponse(userMessage: string): string {
  const responses = [
    `I understand you're asking about "${userMessage.substring(0, 30)}...". This is a fascinating topic in GCSE studies! Let me explain this step by step...`,
    `That's a great question about "${userMessage.substring(0, 30)}...". When we look at this topic in the GCSE curriculum, we need to consider several key points.`,
    `"${userMessage.substring(0, 30)}..." is an important concept to understand for your exams. Here's how I would approach it:`,
    `I'd be happy to help you with "${userMessage.substring(0, 30)}...". This is exactly the kind of question that comes up in GCSE examinations.`,
    `Let's break down "${userMessage.substring(0, 30)}..." into more manageable parts so it's easier to understand for your GCSE studies.`
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  return `${randomResponse}

First, let's consider the main concepts involved. This is a key area in the GCSE curriculum that builds on your previous knowledge. 

I would suggest approaching this by:
1. Understanding the fundamental principles
2. Working through some example problems
3. Connecting it to related topics in the syllabus

Would you like me to explain any specific part of this topic in more detail? Or perhaps work through a practice question together?`;
}

// Export a function to get the OpenAI API key
export async function getOpenAIApiKey(): Promise<string | null> {
  // Try Supabase secrets first
  try {
    const { data } = await supabase.functions.invoke('get-secret', {
      body: { name: 'OPENAI_API_KEY' }
    });
    
    if (data?.secret) {
      return data.secret;
    }
  } catch (error) {
    console.log('Could not retrieve OpenAI key from Supabase secrets', error);
  }
  
  // Fall back to hard-coded key (only for development)
  const fallbackKey = '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';
  
  return fallbackKey;
}
