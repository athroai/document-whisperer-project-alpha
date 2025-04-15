
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

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
      'Content-Type': 'application/json',
    },
    // Enhanced debug logging with more details
    fetch: (url, options) => {
      const urlString = url.toString();
      console.log(`Supabase request: ${urlString.split('?')[0]}`);
      console.log('Request headers:', options?.headers);
      
      return fetch(url, options)
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

// Import the improved connection test
import { testSupabaseConnection } from '@/services/connectionTest';

// Export the connection test for use elsewhere
export const testConnection = testSupabaseConnection;

// Run an initial connection test when the client is loaded
setTimeout(() => {
  console.log('Running initial connection test...');
  testSupabaseConnection().then(result => {
    if (!result.success) {
      console.log(`Initial connection test failed: ${result.message}`);
    }
  });
}, 1000);

export default supabase;
