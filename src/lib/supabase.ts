
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for the entire app
const supabaseUrl = 'https://napltpaxwatxdmkothec.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcGx0cGF4d2F0eGRta290aGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MDgwMDYsImV4cCI6MjA2MDI4NDAwNn0.hmc0knvRNDMZNYnsw1RpYDtOlqP4JUqW6Cn5_FptetE';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});

// Helper function to verify authentication
export const verifyAuth = async () => {
  try {
    // First check for mock user for development environment
    if (localStorage.getItem('athro_user')) {
      const mockUser = JSON.parse(localStorage.getItem('athro_user') || '{}');
      
      if (mockUser.id) {
        console.log('Using mock authentication for Supabase');
        
        // Create a Supabase reference for the mock user
        try {
          const { data, error } = await supabase
            .from('profiles')
            .upsert({ 
              id: mockUser.id, 
              email: mockUser.email,
              role: mockUser.role,
              name: mockUser.displayName || mockUser.email.split('@')[0]
            }, { 
              onConflict: 'id' 
            });
            
          if (error) {
            console.warn('Warning: Could not sync mock user with Supabase profiles:', error.message);
          }
        } catch (err) {
          console.warn('Error syncing mock user:', err);
        }
        
        return mockUser;
      }
    }
    
    // If no mock user, try to get Supabase session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth verification error:', error.message);
      return null;
    }
    
    return data?.session?.user || null;
  } catch (err) {
    console.error('Error in verifyAuth:', err);
    
    // Fallback to mock authentication
    if (localStorage.getItem('athro_user')) {
      const mockUser = JSON.parse(localStorage.getItem('athro_user') || '{}');
      if (mockUser.id) return mockUser;
    }
    
    return null;
  }
};
