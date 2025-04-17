
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error("Missing OpenAI API key");
    }

    const { subject, difficulty = 5, count = 5 } = await req.json();
    
    if (!subject) {
      throw new Error("Subject is required");
    }

    console.log(`Generating ${count} ${subject} questions at difficulty level ${difficulty}`);

    const difficultyLevel = difficulty <= 3 ? "easy" : difficulty <= 7 ? "medium" : "hard";
    
    // Prepare the prompt for quiz generation
    const prompt = `Generate a ${difficultyLevel} difficulty quiz for GCSE ${subject} with ${count} multiple-choice questions. 
    
Each question must follow this strict JSON format:
{
  "question": "The question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option X", // Must be exactly one of the options
  "difficulty": "${difficultyLevel}", // easy, medium, or hard 
  "topic": "specific topic within ${subject}"
}

Return the result as a valid JSON array of question objects. Do not include any explanations or additional text outside the JSON array.
`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional educator creating GCSE quiz questions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);
      throw new Error(`OpenAI API error: ${data.error?.message || "Unknown error"}`);
    }

    let rawQuizContent = data.choices[0].message.content;
    console.log("Raw quiz content:", rawQuizContent);
    
    // Extract JSON array from the response (handle cases where GPT adds markdown or explanations)
    const jsonMatch = rawQuizContent.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      rawQuizContent = jsonMatch[0];
    }
    
    let questions;
    try {
      questions = JSON.parse(rawQuizContent);
      
      // Validate the response format
      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array");
      }
      
      // Process each question to ensure it has the expected format
      // Note the mapping of 'question' to 'text' to match our Question interface
      questions = questions.map((q, index) => ({
        id: `gpt-${Date.now()}-${index}`,
        text: q.question, // Map question to text
        answers: q.options.map((option, i) => ({
          id: `answer-${index}-${i}`,
          text: option,
          isCorrect: option === q.correctAnswer
        })),
        difficulty: q.difficulty || difficultyLevel,
        topic: q.topic || subject,
        subject: subject
      }));
    } catch (error) {
      console.error("Error parsing quiz content:", error);
      throw new Error(`Failed to parse quiz content: ${error.message}`);
    }

    console.log(`Successfully generated ${questions.length} questions`);

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate quiz" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
