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

  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  
  // If no API key is found, return mock questions
  if (!OPENAI_API_KEY) {
    console.log("No OpenAI API key found. Using mock questions.");
    return new Response(
      JSON.stringify({ 
        questions: generateMockQuestions(), 
        fromMock: true 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { subject, difficulty = 5, count = 5 } = await req.json();
    
    if (!subject) {
      throw new Error("Subject is required");
    }

    const difficultyLevel = difficulty <= 3 ? "easy" : difficulty <= 7 ? "medium" : "hard";
    
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
            content: `Generate ${count} ${difficultyLevel} difficulty multiple-choice questions for GCSE ${subject}. 
            Return a JSON array with each question having: 
            id, text, correctAnswer, options, difficulty, subject, topic`
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

    let questions;
    try {
      questions = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error("Failed to parse questions:", parseError);
      throw new Error("Invalid question format received from OpenAI");
    }
    
    // Validate questions have required fields
    const validQuestions = questions.filter(q => 
      q.id && 
      q.text && 
      q.correctAnswer && 
      q.options && 
      q.options.length > 0
    );

    if (validQuestions.length === 0) {
      throw new Error("No valid questions generated");
    }
    
    return new Response(
      JSON.stringify({ 
        questions: validQuestions, 
        fromMock: false 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error generating quiz:", error);
    
    return new Response(
      JSON.stringify({ 
        questions: generateMockQuestions(), 
        fromMock: true,
        error: error.message 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateMockQuestions() {
  return [
    {
      id: `mock-math-1`,
      text: "What is the value of x in the equation 3x + 7 = 22?",
      options: ["3", "5", "7", "15"],
      correctAnswer: "5",
      difficulty: "medium",
      topic: "algebra",
      subject: "Mathematics"
    },
    {
      id: `mock-math-2`,
      text: "What is the area of a circle with radius 4 units?",
      options: ["16π square units", "8π square units", "4π square units", "π square units"],
      correctAnswer: "16π square units",
      difficulty: "medium",
      topic: "geometry",
      subject: "Mathematics"
    },
    {
      id: `mock-sci-1`,
      text: "Which of these is a noble gas?",
      options: ["Oxygen", "Chlorine", "Neon", "Sodium"],
      correctAnswer: "Neon",
      difficulty: "medium",
      topic: "periodic table",
      subject: "Science"
    },
    {
      id: `mock-eng-1`,
      text: "Which literary device involves giving human qualities to non-human things?",
      options: ["Metaphor", "Personification", "Simile", "Alliteration"],
      correctAnswer: "Personification",
      difficulty: "medium",
      topic: "literary devices",
      subject: "English"
    },
    {
      id: `mock-hist-1`,
      text: "Which event marked the start of World War I?",
      options: ["The invasion of Poland", "The bombing of Pearl Harbor", "The assassination of Archduke Franz Ferdinand", "The sinking of the Lusitania"],
      correctAnswer: "The assassination of Archduke Franz Ferdinand",
      difficulty: "medium",
      topic: "world wars",
      subject: "History"
    }
  ];
}
