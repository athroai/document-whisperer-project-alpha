
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile, UserUpdateData } from '@/types/auth';
import { useToast } from './use-toast';
import { objectToSnakeCase } from '@/utils/formatters';

export const useUserProfile = () => {
  const { toast } = useToast();

  const updateProfile = async (data: UserUpdateData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('profiles')
        .update(objectToSnakeCase(data))
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  return { updateProfile };
};
