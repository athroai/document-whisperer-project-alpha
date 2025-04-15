
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for the entire app
const supabaseUrl = 'https://napltpaxwatxdmkothec.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcGx0cGF4d2F0eGRta290aGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MDgwMDYsImV4cCI6MjA2MDI4NDAwNn0.hmc0knvRNDMZNYnsw1RpYDtOlqP4JUqW6Cn5_FptetE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
