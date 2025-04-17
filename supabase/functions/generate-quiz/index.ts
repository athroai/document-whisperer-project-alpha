
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
      // Check if the response contains a 'questions' array directly or needs JSON parsing
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        
        // Try to parse the content if it's a string
        if (typeof content === 'string') {
          // Remove markdown code block formatting if present
          const jsonContent = content
            .replace(/```json\s*/g, '')
            .replace(/```\s*$/g, '')
            .replace(/```\s*/g, '')
            .trim();
          
          questions = JSON.parse(jsonContent);
          
          // If parsing returned an object with a 'questions' property, use that
          if (questions.questions && Array.isArray(questions.questions)) {
            questions = questions.questions;
          }
        } else if (typeof content === 'object') {
          // If content is already an object, check if it has a 'questions' array
          questions = content.questions || content;
        }
      }
      
      // If questions is still not defined or not an array, throw an error
      if (!questions || !Array.isArray(questions)) {
        console.error("Invalid response format:", data);
        throw new Error("Invalid question format received from OpenAI");
      }
    } catch (parseError) {
      console.error("Failed to parse questions:", parseError);
      console.error("Raw content:", data.choices?.[0]?.message?.content);
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
