
// src/lib/openai.ts
export async function getOpenAIResponse({
  systemPrompt,
  userMessage,
  apiKey,
}: {
  systemPrompt: string;
  userMessage: string;
  apiKey: string;
}) {
  console.log('🔌 Starting OpenAI API request with message:', userMessage.substring(0, 50) + '...');
  
  try {
    // For testing, always use mock responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Using mock response in development environment');
      
      // Wait for a short time to simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Return a contextual mock response based on the user message
      if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
        return `Hello! I'm AthroMaths, your GCSE Maths mentor. How can I help you with your mathematics studies today?`;
      } else if (userMessage.toLowerCase().includes('algebra')) {
        return `Algebra is all about finding the unknown values. Let's break down this topic together. Would you like to start with simple equations or move to something more challenging like quadratics?`;
      } else if (userMessage.toLowerCase().includes('geometry')) {
        return `Geometry explores the properties and relationships of shapes and spaces. Which specific area of geometry are you interested in? We could look at angles, triangles, circles, or coordinate geometry.`;
      } else if (userMessage.toLowerCase().includes('help')) {
        return `I'm here to help with any mathematics questions you have. You can ask me about specific topics, practice problems, or general study strategies. What would you like to focus on today?`;
      } else if (userMessage.includes('2-1')) {
        return `The answer to 2-1 is 1. This is a basic subtraction operation. Would you like me to help you with more complex math problems?`;
      } else {
        return `That's an interesting question about ${userMessage.split(' ').slice(0, 3).join(' ')}... Let me help you understand this concept step by step. What specific part are you finding challenging?`;
      }
    }

    console.log('📡 Making actual OpenAI API call - Network request starting...');
    
    // Log request details for debugging
    console.log('🔍 Request Details:', {
      url: 'https://api.openai.com/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer [REDACTED]',
      },
      body: {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `${systemPrompt.substring(0, 50)}...` },
          { role: 'user', content: `${userMessage.substring(0, 50)}...` },
        ],
        temperature: 0.7,
      },
    });

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', 
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
      }),
    });

    console.log('📥 OpenAI API response status:', res.status);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('❌ OpenAI API error response:', errorData);
      throw new Error(errorData.error?.message || `Failed with status: ${res.status}`);
    }

    const data = await res.json();
    console.log('✅ OpenAI API response received successfully');
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('🔥 Error in getOpenAIResponse:', error);
    
    // Check for network-related errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('📶 Network error detected - possibly CORS or connectivity issue');
    }
    
    // Return a fallback response instead of throwing the error
    return `I'm having trouble connecting to my knowledge base right now. Could you try asking me again in a slightly different way?`;
  }
}
