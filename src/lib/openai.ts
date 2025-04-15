
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
  console.log('Starting OpenAI API request...');
  
  try {
    // Add a random delay to help with testing
    console.log('Simulating network latency...');
    
    // Add a test response for development
    if (process.env.NODE_ENV === 'development' && Math.random() > 0.2) {
      console.log('Using mock response in development');
      // Wait for a short time to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a mock response based on the user message
      if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
        return `Hello! I'm AthroMaths, your GCSE Maths mentor. How can I help you with your mathematics studies today?`;
      } else if (userMessage.toLowerCase().includes('algebra')) {
        return `Algebra is all about finding the unknown values. Let's break down this topic together. Would you like to start with simple equations or move to something more challenging like quadratics?`;
      } else {
        return `That's an interesting question about ${userMessage.split(' ').slice(0, 3).join(' ')}... Let me help you understand this concept step by step. What specific part are you finding challenging?`;
      }
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using the current recommended model instead of deprecated gpt-4
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.8,
      }),
    });

    console.log('OpenAI API response status:', res.status);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      throw new Error(errorData.error?.message || `Failed with status: ${res.status}`);
    }

    const data = await res.json();
    console.log('OpenAI API response data received');
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error in getOpenAIResponse:', error);
    throw error;
  }
}
