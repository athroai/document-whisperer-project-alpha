
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    // If no API key is found, use mock questions instead
    if (!OPENAI_API_KEY) {
      console.log("No OpenAI API key found. Using mock questions instead.");
      return new Response(
        JSON.stringify({ 
          questions: generateMockQuestions(), 
          fromMock: true 
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

      if (questions.length === 0) {
        throw new Error("No questions were generated");
      }
    } catch (error) {
      console.error("Error parsing quiz content:", error);
      // Fall back to mock questions if parsing fails
      questions = generateMockQuestions();
    }

    console.log(`Successfully generated ${questions.length} questions`);

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    
    // Return mock questions on error
    return new Response(
      JSON.stringify({ 
        questions: generateMockQuestions(), 
        fromMock: true,
        error: error.message || "Failed to generate quiz" 
      }),
      { 
        status: 200, // Return 200 instead of 500 to avoid client errors
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Generate mock questions as a fallback
function generateMockQuestions() {
  const mockQuestions = [
    {
      id: `mock-math-1`,
      text: "What is the value of x in the equation 3x + 7 = 22?",
      answers: [
        { id: "math-1-a", text: "3", isCorrect: false },
        { id: "math-1-b", text: "5", isCorrect: true },
        { id: "math-1-c", text: "7", isCorrect: false },
        { id: "math-1-d", text: "15", isCorrect: false }
      ],
      difficulty: "medium",
      topic: "algebra",
      subject: "Mathematics"
    },
    {
      id: `mock-math-2`,
      text: "What is the area of a circle with radius 4 units?",
      answers: [
        { id: "math-2-a", text: "16π square units", isCorrect: true },
        { id: "math-2-b", text: "8π square units", isCorrect: false },
        { id: "math-2-c", text: "4π square units", isCorrect: false },
        { id: "math-2-d", text: "π square units", isCorrect: false }
      ],
      difficulty: "medium",
      topic: "geometry",
      subject: "Mathematics"
    },
    {
      id: `mock-sci-1`,
      text: "Which of these is a noble gas?",
      answers: [
        { id: "sci-1-a", text: "Oxygen", isCorrect: false },
        { id: "sci-1-b", text: "Chlorine", isCorrect: false },
        { id: "sci-1-c", text: "Neon", isCorrect: true },
        { id: "sci-1-d", text: "Sodium", isCorrect: false }
      ],
      difficulty: "medium",
      topic: "periodic table",
      subject: "Science"
    },
    {
      id: `mock-eng-1`,
      text: "Which literary device involves giving human qualities to non-human things?",
      answers: [
        { id: "eng-1-a", text: "Metaphor", isCorrect: false },
        { id: "eng-1-b", text: "Personification", isCorrect: true },
        { id: "eng-1-c", text: "Simile", isCorrect: false },
        { id: "eng-1-d", text: "Alliteration", isCorrect: false }
      ],
      difficulty: "medium",
      topic: "literary devices",
      subject: "English"
    },
    {
      id: `mock-hist-1`,
      text: "Which event marked the start of World War I?",
      answers: [
        { id: "hist-1-a", text: "The invasion of Poland", isCorrect: false },
        { id: "hist-1-b", text: "The bombing of Pearl Harbor", isCorrect: false },
        { id: "hist-1-c", text: "The assassination of Archduke Franz Ferdinand", isCorrect: true },
        { id: "hist-1-d", text: "The sinking of the Lusitania", isCorrect: false }
      ],
      difficulty: "medium",
      topic: "world wars",
      subject: "History"
    }
  ];
  
  return mockQuestions;
}
