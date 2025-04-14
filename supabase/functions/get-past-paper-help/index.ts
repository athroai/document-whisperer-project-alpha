
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
    
    // Parse request body
    const { subject, query, exam_board, year } = await req.json()
    
    if (!subject || !query) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Build query to search past papers
    let paperQuery = supabase
      .from('past_papers')
      .select(`
        id,
        title,
        subject,
        exam_board,
        year,
        season,
        model_answers (
          id,
          answer_text,
          question_number
        )
      `)
      .eq('subject', subject)
      .order('year', { ascending: false })
    
    // Apply additional filters if provided
    if (exam_board) {
      paperQuery = paperQuery.eq('exam_board', exam_board)
    }
    
    if (year) {
      paperQuery = paperQuery.eq('year', year)
    }
    
    // Limit results
    paperQuery = paperQuery.limit(5)
    
    // Execute the query
    const { data: papers, error: papersError } = await paperQuery
    
    if (papersError) {
      return new Response(
        JSON.stringify({ error: 'Failed to search past papers', details: papersError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // In a real implementation, we would use a vector search or keyword matching
    // For now, we'll do a simple keyword matching on paper titles
    const keywords = query.toLowerCase().split(' ').filter(k => k.length > 3)
    
    // Filter and rank results
    const rankedPapers = papers
      .map(paper => {
        // Calculate a simple relevance score
        const titleLower = paper.title.toLowerCase()
        const keywordMatches = keywords.filter(k => titleLower.includes(k)).length
        const relevance = keywordMatches / keywords.length
        
        return {
          ...paper,
          relevance: relevance > 0 ? relevance : 0.1 // Give some baseline relevance
        }
      })
      .sort((a, b) => b.relevance - a.relevance)
    
    // Log the AI interaction
    await supabase
      .from('ai_logs')
      .insert({
        user_id: user.id,
        request_type: 'past_paper_search',
        prompt: query,
        model: 'simple-paper-search'
      })
    
    // Return results
    return new Response(
      JSON.stringify({
        papers: rankedPapers,
        query_details: {
          subject,
          query,
          exam_board: exam_board || 'any',
          year: year || 'any'
        }
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
