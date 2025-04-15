
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

// Comprehensive connection test function
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // First try a plain fetch to see if the domain is reachable
    try {
      console.log('Testing basic network connectivity to Supabase domain...');
      const domainResponse = await fetch(`${SUPABASE_URL}/ping`, { 
        method: 'GET',
        mode: 'no-cors' // This won't give response data but will tell us if network connection works
      });
      console.log('Domain reachability test complete', domainResponse);
    } catch (error) {
      console.error('Cannot reach Supabase domain - possible network/CORS issue:', error);
    }
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
    );
    
    console.log('Testing database query...');
    const queryPromise = supabase.from('profiles').select('count').limit(1);
    
    // Race between the query and timeout
    const { data, error } = await Promise.race([
      queryPromise,
      timeoutPromise.then(() => {
        throw new Error('Connection timeout');
      })
    ]);
    
    if (error) {
      console.error('Connection test failed with error:', error);
      return { success: false, error, message: error.message };
    }
    
    console.log('Connection test successful:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Connection test exception:', error);
    return { 
      success: false, 
      error, 
      message: error.message || 'Unknown connection error',
      isNetworkError: error.name === 'TypeError' && error.message.includes('Failed to fetch')
    };
  }
};

// Run an initial connection test when the client is loaded
setTimeout(() => {
  console.log('Running initial connection test...');
  testConnection().then(result => {
    if (!result.success) {
      console.log('Initial connection test failed. Check Supabase project settings.');
    }
  });
}, 1000);

export default supabase;
