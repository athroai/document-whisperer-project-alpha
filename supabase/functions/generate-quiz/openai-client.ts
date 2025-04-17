
const OPENAI_API_KEY_1 = Deno.env.get('openAI1');
const OPENAI_API_KEY_2 = Deno.env.get('openAI2');

export async function callOpenAI(apiKey: string, subject: string, difficulty: string, count: number) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional educator creating GCSE quiz questions. Return ONLY valid JSON array without any markdown formatting, code blocks, or explanations."
        },
        {
          role: "user",
          content: `Generate ${count} ${difficulty} difficulty multiple-choice questions for GCSE ${subject}. 
          Return ONLY a JSON array with each question having: 
          id, text, correctAnswer, options, difficulty, subject, topic.
          Do not wrap the JSON in markdown code blocks or add any explanations.`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }, // Enforce JSON format
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  return await response.json();
}

export async function generateQuestions(subject: string, difficulty: string, count: number) {
  let data;
  let usedKey = '';

  // Try first API key
  if (OPENAI_API_KEY_1) {
    try {
      data = await callOpenAI(OPENAI_API_KEY_1, subject, difficulty, count);
      usedKey = 'First Key';
      return { data, usedKey };
    } catch (error) {
      console.warn("First OpenAI API key failed:", error);
    }
  }

  // If first key fails, try second key
  if (OPENAI_API_KEY_2) {
    try {
      data = await callOpenAI(OPENAI_API_KEY_2, subject, difficulty, count);
      usedKey = 'Second Key';
      return { data, usedKey };
    } catch (error) {
      console.warn("Second OpenAI API key failed:", error);
    }
  }

  return { data: null, usedKey: '' };
}
