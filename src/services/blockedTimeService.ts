
import { supabase } from '@/lib/supabase';
import { BlockedTimePreference, UserTimePreference } from '@/types/calendar';

export const fetchBlockedTimes = async (userId: string): Promise<BlockedTimePreference[]> => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('blocked_times')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching blocked times:', error);
      return [];
    }

    return data as BlockedTimePreference[];
  } catch (error) {
    console.error('Error in fetchBlockedTimes:', error);
    return [];
  }
};

export const createBlockedTime = async (
  userId: string,
  blockedTimeData: Omit<BlockedTimePreference, 'id' | 'user_id'>
): Promise<BlockedTimePreference | null> => {
  try {
    const { data, error } = await supabase
      .from('blocked_times')
      .insert({
        user_id: userId,
        title: blockedTimeData.title,
        day_of_week: blockedTimeData.day_of_week,
        start_time: blockedTimeData.start_time,
        end_time: blockedTimeData.end_time,
        reason: blockedTimeData.reason || '',
        priority: blockedTimeData.priority || 'medium'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating blocked time:', error);
      return null;
    }

    return data as BlockedTimePreference;
  } catch (error) {
    console.error('Error in createBlockedTime:', error);
    return null;
  }
};

export const updateBlockedTime = async (
  id: string,
  updates: Partial<BlockedTimePreference>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('blocked_times')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating blocked time:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateBlockedTime:', error);
    return false;
  }
};

export const deleteBlockedTime = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('blocked_times')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blocked time:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteBlockedTime:', error);
    return false;
  }
};

export const fetchTimePreferences = async (userId: string): Promise<UserTimePreference | null> => {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('user_time_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching time preferences:', error);
      return null;
    }

    return data as UserTimePreference || null;
  } catch (error) {
    console.error('Error in fetchTimePreferences:', error);
    return null;
  }
};

export const saveTimePreferences = async (
  userId: string,
  preferences: Omit<UserTimePreference, 'id' | 'user_id'>
): Promise<UserTimePreference | null> => {
  try {
    // First check if preferences already exist
    const { data: existingData } = await supabase
      .from('user_time_preferences')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (existingData?.id) {
      // Update existing preferences
      const { data, error } = await supabase
        .from('user_time_preferences')
        .update(preferences)
        .eq('id', existingData.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating time preferences:', error);
        return null;
      }

      return data as UserTimePreference;
    } else {
      // Create new preferences
      const { data, error } = await supabase
        .from('user_time_preferences')
        .insert({
          user_id: userId,
          ...preferences
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating time preferences:', error);
        return null;
      }

      return data as UserTimePreference;
    }
  } catch (error) {
    console.error('Error in saveTimePreferences:', error);
    return null;
  }
};
