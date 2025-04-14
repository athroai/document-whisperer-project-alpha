import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "@/types/auth";

/**
 * Service for handling authentication related functionality
 */
export const authService = {
  /**
   * Get the current logged in user
   */
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return null;
    
    try {
      // Fetch user profile data
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
        
      if (error) throw error;
      
      const role = (profileData?.role || 'student') as UserRole;
      
      // Map Supabase user and profile data to our User type
      return {
        id: session.user.id,
        email: session.user.email || '',
        role: role,
        displayName: profileData?.name || session.user.email?.split('@')[0] || '',
        createdAt: new Date(session.user.created_at),
        rememberMe: true,
        schoolId: profileData?.school_id || undefined,
        // Use the newly added fields with safe defaults
        examBoard: profileData?.exam_board as 'wjec' | 'ocr' | 'aqa' | 'none' | undefined || undefined,
        confidenceScores: profileData?.confidence_scores as Record<string, number> || {},
        welshEligible: profileData?.welsh_eligible || false,
        preferredLanguage: profileData?.preferred_language as 'en' | 'cy' | 'es' | 'fr' | 'de' || 'en'
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },
  
  /**
   * Login with email and password
   */
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Sign up a new user
   */
  signup: async (
    email: string, 
    password: string,
    role: UserRole = 'student',
    additionalData?: Record<string, any>
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          ...additionalData
        }
      }
    });
    
    if (error) throw error;
    return data;
  },
  
  /**
   * Log out the current user
   */
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  /**
   * Update user profile data
   */
  updateProfile: async (userId: string, userData: Partial<Record<string, any>>) => {
    const { error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', userId);
      
    if (error) throw error;
  }
};

export default authService;
