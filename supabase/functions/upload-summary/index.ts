
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
    const { file_id, subject } = await req.json()
    
    if (!file_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required file_id parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Get file details
    const { data: fileData, error: fileError } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', file_id)
      .single()
      
    if (fileError || !fileData) {
      return new Response(
        JSON.stringify({ error: 'File not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // In a real implementation, we would download the file and send it to an AI model
    // For now, we'll generate a simple summary based on the file metadata
    const summary = generateMockSummary(fileData.original_name || fileData.filename, subject)
    
    // Store the summary in ai_outputs storage bucket
    const summaryFileName = `${fileData.id}_summary.txt`
    const summaryPath = `${subject || 'general'}/${summaryFileName}`
    
    const { data: storageData, error: storageError } = await supabase.storage
      .from('ai_outputs')
      .upload(summaryPath, summary, {
        contentType: 'text/plain',
        upsert: true
      })
      
    if (storageError) {
      return new Response(
        JSON.stringify({ error: 'Failed to store summary', details: storageError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Get public URL for the summary
    const { data: { publicUrl } } = await supabase.storage
      .from('ai_outputs')
      .getPublicUrl(summaryPath)
    
    // Create a record in the uploads table for the summary
    const { data: uploadData, error: uploadError } = await supabase
      .from('uploads')
      .insert({
        filename: summaryFileName,
        original_name: `Summary of ${fileData.original_name || fileData.filename}`,
        storage_path: summaryPath,
        bucket_name: 'ai_outputs',
        subject: fileData.subject,
        file_type: 'ai_summary',
        visibility: fileData.visibility,
        uploaded_by: user.id,
        file_url: publicUrl,
        mime_type: 'text/plain'
      })
      .select('id')
      .single()
    
    if (uploadError) {
      return new Response(
        JSON.stringify({ error: 'Failed to record summary file', details: uploadError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Log the AI interaction
    await supabase
      .from('ai_logs')
      .insert({
        user_id: user.id,
        request_type: 'file_summary',
        prompt: `Summarize file: ${fileData.original_name || fileData.filename}`,
        model: 'mock-summarizer'
      })
    
    // Return success with summary and file details
    return new Response(
      JSON.stringify({
        success: true,
        summary: summary.substring(0, 200) + '...',  // Preview of summary
        summary_id: uploadData.id,
        summary_url: publicUrl
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

// Mock summary generator (would be replaced with actual AI call in production)
function generateMockSummary(filename: string, subject: string | null): string {
  const now = new Date().toISOString().split('T')[0]
  const filenameParts = filename.split('.')
  const extension = filenameParts.pop()
  const name = filenameParts.join('.')
  
  let summary = `# Summary of ${name}\n\nGenerated on ${now}\n\n`
  
  // Add some realistic-looking content based on file type
  switch (extension?.toLowerCase()) {
    case 'pdf':
      summary += 'This PDF document appears to contain '
      break
    case 'docx':
    case 'doc':
      summary += 'This Word document contains '
      break
    case 'txt':
      summary += 'This text file provides '
      break
    default:
      summary += 'This document presents '
  }
  
  // Add subject-specific content
  if (subject) {
    switch (subject.toLowerCase()) {
      case 'mathematics':
        summary += 'mathematical concepts related to algebra, geometry, and calculus. Key topics covered include:\n\n' +
          '- Linear equations and their applications\n' +
          '- Quadratic functions and their graphs\n' +
          '- Basic principles of geometry including triangles and circles\n' +
          '- Introduction to differential calculus\n\n' +
          'The document includes several worked examples that demonstrate problem-solving techniques. Important formulas are highlighted throughout the text, with special emphasis on the quadratic formula and the Pythagorean theorem.\n\n' +
          'Main concepts:\n' +
          '1. Function notation and evaluation\n' +
          '2. Solving equations with one and two variables\n' +
          '3. Properties of geometric shapes\n' +
          '4. Basic differentiation rules';
        break
      case 'english':
        summary += 'literary analysis focusing on themes, characters, and narrative techniques. The document explores:\n\n' +
          '- Character development through dialogue and action\n' +
          '- Symbolic elements and their significance to the plot\n' +
          '- Narrative perspective and its impact on reader interpretation\n' +
          '- Contextual influences on the work\n\n' +
          'The analysis draws connections between the text and broader literary movements, with particular attention to how social and historical context shapes meaning.\n\n' +
          'Key points:\n' +
          '1. The protagonist\'s journey reflects classic hero\'s journey structure\n' +
          '2. Recurring motifs of water and light establish thematic concerns\n' +
          '3. Linguistic choices reveal author\'s attitude toward subject matter\n' +
          '4. Comparison with contemporaneous works shows innovative narrative approach';
        break
      case 'science':
        summary += 'scientific concepts and experimental findings related to biology, chemistry and physics. The document covers:\n\n' +
          '- Fundamental principles of scientific inquiry\n' +
          '- Experimental methodology and results\n' +
          '- Data analysis and interpretation\n' +
          '- Application of scientific theories to real-world problems\n\n' +
          'Several experiments are described in detail, with clear protocol steps and expected outcomes. The document includes data tables and visual representations of findings.\n\n' +
          'Main topics:\n' +
          '1. Experimental design and control variables\n' +
          '2. Statistical analysis of collected data\n' +
          '3. Evaluation of evidence supporting scientific claims\n' +
          '4. Limitations of current methodologies and suggestions for improvement';
        break
      default:
        summary += 'information on various topics including definitions, explanations and examples. The document is structured with clear headings and subheadings, making it easy to navigate through different sections.\n\n' +
          'Key sections include:\n' +
          '- Introduction to core concepts\n' +
          '- Detailed explanations with supporting evidence\n' +
          '- Practical applications and case studies\n' +
          '- Summary of main points and conclusions';
    }
  } else {
    summary += 'information on a variety of topics, organized in a structured format with clear sections and subsections. The content appears to be academic in nature, with references to established theories and concepts.\n\n' +
      'The document includes both theoretical frameworks and practical applications, with examples that illustrate key points. Several visual elements (likely charts, graphs or diagrams) are referenced throughout the text to support the written content.';
  }
  
  summary += '\n\n## Recommendations for Study\n\n' +
    '- Create flashcards for key terms and concepts\n' +
    '- Develop summary notes highlighting main ideas\n' +
    '- Practice applying concepts to new examples\n' +
    '- Connect ideas from this document to other course materials\n\n' +
    'This summary was generated automatically and may not capture all nuances of the original document.';
  
  return summary
}
