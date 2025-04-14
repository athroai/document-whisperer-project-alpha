
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Create authenticated Supabase client
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Create a Supabase client with the Auth header
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    })
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized or invalid user' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Parse and validate request
    const { task_id, submission_text, submission_id } = await req.json()
    
    if (!task_id || !submission_text) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Get task details
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('id, title, description, subject')
      .eq('id', task_id)
      .single()
      
    if (taskError || !taskData) {
      return new Response(
        JSON.stringify({ error: 'Task not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // In a real implementation, we would send the submission to an AI model
    // For now, we'll generate a simple feedback response
    const feedback = generateBasicFeedback(submission_text, taskData.subject)
    
    // Store submission if not already exists
    let submissionId = submission_id
    if (!submissionId) {
      const { data: submissionData, error: submissionError } = await supabase
        .from('task_submissions')
        .insert({
          task_id,
          student_id: user.id,
          submission_text,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .select('id')
        .single()
      
      if (submissionError) {
        return new Response(
          JSON.stringify({ error: 'Failed to save submission' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      submissionId = submissionData.id
    }
    
    // Store AI feedback
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedback')
      .insert({
        task_id,
        student_id: user.id,
        submission_id: submissionId,
        ai_feedback: feedback,
        score: calculateScore(submission_text, taskData.subject)
      })
      .select('id')
    
    if (feedbackError) {
      return new Response(
        JSON.stringify({ error: 'Failed to save feedback' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Log the AI interaction
    await supabase
      .from('ai_logs')
      .insert({
        user_id: user.id,
        request_type: 'submission_feedback',
        prompt: submission_text,
        tokens_used: submission_text.length / 4, // Rough estimate
        model: 'simple-feedback-generator'
      })
    
    // Return the feedback
    return new Response(
      JSON.stringify({
        feedback,
        submission_id: submissionId,
        feedback_id: feedbackData[0].id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Mock feedback generator (would be replaced with actual AI call in production)
function generateBasicFeedback(text: string, subject: string | null): string {
  // Length-based review
  const length = text.length
  let feedback = ''
  
  if (length < 100) {
    feedback = 'Your answer is quite short. Consider developing your ideas further with more detail and explanation.'
  } else if (length < 500) {
    feedback = 'Your answer covers some key points but could benefit from more detail and specific examples.'
  } else {
    feedback = 'You\'ve provided a detailed response with good development of ideas.'
  }
  
  // Subject-specific feedback
  if (subject) {
    switch (subject.toLowerCase()) {
      case 'mathematics':
        feedback += ' Remember to clearly show your working out for mathematical problems and check your calculations.'
        break
      case 'english':
        feedback += ' Pay attention to your use of evidence from the text to support your points, and ensure your analysis is thorough.'
        break
      case 'science':
        feedback += ' Scientific explanations should include relevant terminology and clear cause-effect relationships.'
        break
    }
  }
  
  feedback += '\n\nAreas for improvement:\n- Ensure your answer directly addresses all parts of the question\n- Use subject-specific terminology where appropriate\n- Check your work for clarity and coherence'
  
  return feedback
}

// Mock score calculator
function calculateScore(text: string, subject: string | null): number {
  // Simple length-based scoring (0-100)
  const length = text.length
  
  // Base score on length (max 85 points)
  let score = Math.min(85, length / 10)
  
  // Add some randomness (±15 points)
  score += Math.random() * 15
  
  // Cap at 100
  return Math.min(100, Math.round(score))
}
