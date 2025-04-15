
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { testSupabaseConnection } from '@/services/connectionTest';

const SUPABASE_URL = "https://oqpwgxrqwbgchirnnejj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcHdneHJxd2JnY2hpcm5uZWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NTIyNDUsImV4cCI6MjA2MDIyODI0NX0.PB-H47Q9C6cpUm_uGUpLE1gMsBJ0hMcecBQu9rE0aJA";

// Log connection details for troubleshooting
console.log(`Initializing Supabase with URL: ${SUPABASE_URL}`);

// Create a properly typed Supabase client with explicit Database type
export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY, 
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true
    },
    global: {
      headers: {
        'Content-Type': 'application/json'
      },
      // Properly type the fetch function parameters
      fetch: (url: RequestInfo | URL, fetchOptions: RequestInit = {}) => {
        const urlString = url.toString();
        
        // Create a new Headers object from existing headers or empty object
        const headers = new Headers(fetchOptions.headers || {});
        
        // Add required Supabase headers
        headers.set('apikey', SUPABASE_PUBLISHABLE_KEY);
        headers.set('Authorization', `Bearer ${SUPABASE_PUBLISHABLE_KEY}`);
        
        console.log(`Supabase request: ${urlString.split('?')[0]}`);
        console.log('Request headers:', Object.fromEntries(headers.entries()));
        
        // Return the fetch with updated headers
        return fetch(url, { 
          ...fetchOptions, 
          headers 
        })
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
  }
);

// Export the test connection utility
export const testConnection = async () => {
  return await testSupabaseConnection();
};

export default supabase;
