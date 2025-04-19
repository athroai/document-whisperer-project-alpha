
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BlockedTimePreference, UserTimePreference } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchBlockedTimes, 
  createBlockedTime, 
  updateBlockedTime, 
  deleteBlockedTime,
  fetchTimePreferences,
  saveTimePreferences
} from '@/services/blockedTimeService';

export const useBlockedTimes = () => {
  const [blockedTimes, setBlockedTimes] = useState<BlockedTimePreference[]>([]);
  const [timePreferences, setTimePreferences] = useState<UserTimePreference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { state: authState } = useAuth();
  const { toast } = useToast();

  const loadBlockedTimes = async () => {
    if (!authState.user?.id) return;
    
    try {
      setIsLoading(true);
      const times = await fetchBlockedTimes(authState.user.id);
      setBlockedTimes(times);
      
      const prefs = await fetchTimePreferences(authState.user.id);
      setTimePreferences(prefs);
    } catch (error) {
      console.error('Error loading blocked times:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authState.user?.id) {
      loadBlockedTimes();
    } else {
      setBlockedTimes([]);
      setTimePreferences(null);
    }
  }, [authState.user?.id]);

  const addBlockedTime = async (data: Omit<BlockedTimePreference, 'id' | 'user_id'>) => {
    if (!authState.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to block times.",
        variant: "destructive"
      });
      return null;
    }

    try {
      const newBlockedTime = await createBlockedTime(authState.user.id, data);
      
      if (newBlockedTime) {
        setBlockedTimes(prev => [...prev, newBlockedTime]);
        toast({
          title: "Success",
          description: "Time blocked successfully."
        });
        return newBlockedTime;
      } else {
        throw new Error("Failed to create blocked time");
      }
    } catch (error) {
      console.error('Error adding blocked time:', error);
      toast({
        title: "Error",
        description: "Failed to block time. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateTime = async (id: string, updates: Partial<BlockedTimePreference>) => {
    try {
      const success = await updateBlockedTime(id, updates);
      
      if (success) {
        setBlockedTimes(prev => 
          prev.map(time => time.id === id ? { ...time, ...updates } : time)
        );
        
        toast({
          title: "Success",
          description: "Blocked time updated successfully."
        });
        
        return true;
      } else {
        throw new Error("Failed to update blocked time");
      }
    } catch (error) {
      console.error('Error updating blocked time:', error);
      toast({
        title: "Error",
        description: "Failed to update blocked time. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const removeBlockedTime = async (id: string) => {
    try {
      const success = await deleteBlockedTime(id);
      
      if (success) {
        setBlockedTimes(prev => prev.filter(time => time.id !== id));
        
        toast({
          title: "Success",
          description: "Blocked time removed successfully."
        });
        
        return true;
      } else {
        throw new Error("Failed to delete blocked time");
      }
    } catch (error) {
      console.error('Error removing blocked time:', error);
      toast({
        title: "Error",
        description: "Failed to remove blocked time. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const updateUserTimePreferences = async (preferences: Omit<UserTimePreference, 'id' | 'user_id'>) => {
    if (!authState.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to update time preferences.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const updatedPrefs = await saveTimePreferences(authState.user.id, preferences);
      
      if (updatedPrefs) {
        setTimePreferences(updatedPrefs);
        
        toast({
          title: "Success",
          description: "Time preferences updated successfully."
        });
        
        return true;
      } else {
        throw new Error("Failed to update time preferences");
      }
    } catch (error) {
      console.error('Error updating time preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update time preferences. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    blockedTimes,
    timePreferences,
    isLoading,
    loadBlockedTimes,
    addBlockedTime,
    updateTime: updateTime,
    removeBlockedTime,
    updateUserTimePreferences
  };
};
