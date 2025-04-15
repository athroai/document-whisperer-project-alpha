
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://oqpwgxrqwbgchirnnejj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcHdneHJxd2JnY2hpcm5uZWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NTIyNDUsImV4cCI6MjA2MDIyODI0NX0.PB-H47Q9C6cpUm_uGUpLE1gMsBJ0hMcecBQu9rE0aJA";

// Create a properly typed Supabase client with explicit Database type and auth configuration
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    },
    // Log debug information
    fetch: (url, options) => {
      console.log(`Making Supabase request to: ${url.toString().split('?')[0]}`);
      return fetch(url, options);
    }
  }
});

// Add a simple wrapper to test connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Connection test failed with error:', error);
      return { success: false, error };
    }
    
    console.log('Connection test successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Connection test exception:', error);
    return { success: false, error };
  }
};

export default supabase;
