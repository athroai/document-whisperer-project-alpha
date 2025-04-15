
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
