import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { testSupabaseConnection } from '@/services/connectionTest';

const SUPABASE_URL = "https://oqpwgxrqwbgchirnnejj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcHdneHJxd2JnY2hpcm5uZWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NTIyNDUsImV4cCI6MjA2MDIyODI0NX0.PB-H47Q9C6cpUm_uGUpLE1gMsBJ0hMcecBQu9rE0aJA";

// Log connection details for troubleshooting
console.log(`Initializing Supabase with URL: ${SUPABASE_URL}`);

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
    fetch: (url, options = {}) => {
      const urlString = url.toString();
      const headers = new Headers(options.headers);

      // ✅ Manually include the API key and Authorization token
      headers.set('apikey', SUPABASE_PUBLISHABLE_KEY);
      headers.set('Authorization', `Bearer ${SUPABASE_PUBLISHABLE_KEY}`);

      console.log(`Supabase request: ${urlString.split('?')[0]}`);
      console.log('Request headers:', Object.fromEntries(headers.entries()));

      return fetch(url, { ...options, headers })
        .then(response => {
          console.log(`Supabase response status: ${response.status}`);
          if (!response.ok) {
            console.error(`Supabase request failed with status: ${response.status}`);
          }
          return response;
        })
        .catch(error => {
          console.error(`Supabase fetch error:`, error);
          throw error;
        });
    }
  }
});

// Export the test connection utility
export const testConnection = async () => {
  return await testSupabaseConnection();
};

export default supabase;
