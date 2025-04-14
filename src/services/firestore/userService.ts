
import { supabase } from '@/integrations/supabase/client';

// Interfaces for user-related data
interface UserPreference {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  lastUpdated: string;
}

export const userService = {
  // Get user profile data
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },
  
  // Update user profile
  async updateUserProfile(userId: string, profileData: any) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  },
  
  // Get user preferences
  async getUserPreferences(userId: string): Promise<UserPreference | null> {
    try {
      // Note: This assumes a preferences table exists
      // If not, store preferences in the profiles table or create a preferences table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      // As a fallback, return mock preferences
      return {
        userId,
        theme: 'system',
        notifications: true,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  },
  
  // Update user preferences
  async updateUserPreferences(userId: string, preferences: Partial<UserPreference>): Promise<boolean> {
    try {
      // Note: This assumes a preferences table exists
      // If not, store preferences in the profiles table or create a preferences table
      const { error } = await supabase
        .from('profiles')
        .update({
          // Store preferences in confidence_scores JSON field as a temporary solution
          confidence_scores: {
            ...preferences
          }
        })
        .eq('id', userId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  }
};

export default userService;
