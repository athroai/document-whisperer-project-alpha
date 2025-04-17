
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Verify user is authenticated
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error('Missing authorization header');
    }

    // Get the secret name from the request body
    const { name } = await req.json();
    
    if (!name) {
      throw new Error('Secret name is required');
    }
    
    // Get the requested secret
    const secret = Deno.env.get(name);
    
    if (!secret) {
      throw new Error(`Secret '${name}' not found`);
    }
    
    // Return the secret
    return new Response(JSON.stringify({ secret }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`Error in get-secret function: ${error.message}`);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
