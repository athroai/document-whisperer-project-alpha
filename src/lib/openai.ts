
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
  
  // Use the default API key from the app if available
  const defaultApiKey = localStorage.getItem('athro_admin_openai_key');
  const effectiveApiKey = defaultApiKey || apiKey;
  
  try {
    // Use a proper API key check
    if (!effectiveApiKey || effectiveApiKey.length < 20) {
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
        { role: 'user', content: userMessage },
      ],
    });

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${effectiveApiKey}`,
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
