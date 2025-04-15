
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
    // Skip API call and return mock response for demo keys or development
    if (process.env.NODE_ENV === 'development' || !apiKey.startsWith('sk-') || apiKey.includes('demo')) {
      console.log('🧪 Using mock response for development/demo mode');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      return generateMockResponse(userMessage, systemPrompt);
    }
    
    // Use a proper API key check
    if (!apiKey || apiKey.length < 20) {
      console.error('❌ Invalid OpenAI API key - missing or too short');
      throw new Error('Invalid API key provided. Please check your API key.');
    }
    
    // Full URL for clarity in debugging
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    console.log('🔍 Request URL:', apiUrl);
    
    const requestBody = {
      model: 'gpt-4o', 
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
    };
    
    console.log('📦 Request payload:', {
      model: requestBody.model,
      messages: [
        { role: 'system', content: systemPrompt.substring(0, 50) + '...' },
        { role: 'user', content: userMessage.substring(0, 50) + '...' },
      ],
    });

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
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
    
    // More detailed error logging based on error type
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('📶 Network error detected - possibly CORS or connectivity issue');
    }
    
    throw error; // Rethrow so the caller can handle it appropriately
  }
}

// Helper function to generate mock responses for demo/development
function generateMockResponse(message: string, systemPrompt: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Detect subject from system prompt
  let subject = "general";
  if (systemPrompt.includes('Mathematics')) subject = "mathematics";
  if (systemPrompt.includes('Science')) subject = "science";
  if (systemPrompt.includes('English')) subject = "english";
  if (systemPrompt.includes('History')) subject = "history";
  
  // Subject-specific responses
  if (subject === "mathematics") {
    if (lowerMessage.includes('equation') || lowerMessage.includes('solve')) {
      return "Let's work through this equation step by step. First, we need to identify the type of equation, then apply the appropriate method to solve it. Would you like me to demonstrate with an example?";
    }
    
    if (lowerMessage.includes('algebra') || lowerMessage.includes('simplify')) {
      return "In algebra, we work with variables and constants to represent mathematical relationships. When simplifying expressions, remember to collect like terms and follow the order of operations (BODMAS/PEMDAS). What specific algebra problem are you working on?";
    }
    
    return "I'm your Mathematics mentor. I can help with topics like algebra, geometry, trigonometry, calculus, statistics, and more. What specific area would you like to explore today?";
  }
  
  if (subject === "science") {
    if (lowerMessage.includes('atom') || lowerMessage.includes('element')) {
      return "An atom is the basic unit of a chemical element. It consists of a nucleus (containing protons and neutrons) with electrons orbiting around it. The number of protons determines which element it is. Would you like to know more about atomic structure or learn about a specific element?";
    }
    
    return "As your Science mentor, I can help with biology, chemistry, physics, and other scientific disciplines. What specific science topic are you studying?";
  }
  
  if (subject === "english") {
    if (lowerMessage.includes('essay') || lowerMessage.includes('writing')) {
      return "Essay writing is an essential skill. A good essay typically includes an introduction with a thesis statement, body paragraphs that develop your arguments, and a conclusion that summarizes your points. Would you like specific help with structuring your essay or improving your writing style?";
    }
    
    return "As your English mentor, I can help with literature analysis, poetry, creative writing, grammar, and essay writing. What specific aspect of English would you like to explore?";
  }
  
  if (subject === "history") {
    if (lowerMessage.includes('war') || lowerMessage.includes('battle')) {
      return "Wars and conflicts have shaped much of human history. To understand them fully, we need to consider their causes, key events, and lasting impacts. Which specific historical conflict are you interested in studying?";
    }
    
    return "As your History mentor, I can help with various historical periods and themes. Would you like to explore ancient civilizations, medieval times, modern history, or a specific historical event?";
  }
  
  // Generic fallback
  return "I'm your study mentor. I'm here to help you understand and master your subjects. What specific topic would you like to learn about today?";
}
