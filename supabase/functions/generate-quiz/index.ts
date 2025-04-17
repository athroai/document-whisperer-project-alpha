
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { generateMockQuestions } from "./mock-questions.ts";
import { generateQuestions } from "./openai-client.ts";

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
    const { subject, difficulty = 5, count = 5 } = await req.json();
    
    if (!subject) {
      throw new Error("Subject is required");
    }

    const difficultyLevel = difficulty <= 3 ? "easy" : difficulty <= 7 ? "medium" : "hard";
    
    // Try to generate questions using OpenAI
    const { data, usedKey } = await generateQuestions(subject, difficultyLevel, count);

    // If both keys fail, return mock questions
    if (!data) {
      console.warn("Both OpenAI API keys failed. Using mock questions.");
      return new Response(
        JSON.stringify({ 
          questions: generateMockQuestions(), 
          fromMock: true,
          error: "Both OpenAI API keys failed" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
        fromMock: false,
        usedKey: usedKey
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
