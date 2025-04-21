
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { getProfileByUserId, upsertProfile } from './authProfile';
import { Profile, UserUpdateData, AuthState } from './authTypes';
import { DEFAULT_EXAM_BOARD } from './AuthContext';

export const loginAction = async (email: string, password: string, rememberMe: boolean, updateState: any, getProfile: any, navigate: any) => {
  updateState({ isLoading: true, error: undefined });
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    updateState({ session: data.session, user: data.user });
    await getProfile();
    navigate('/home');
  } catch (error: any) {
    updateState({ error: error.message });
    throw error;
  } finally {
    updateState({ isLoading: false });
  }
};

export const signupAction = async (email: string, password: string, role: string, updateState: any, navigate: any, setAuthProfile: any) => {
  updateState({ isLoading: true, error: undefined });
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role }
      }
    });
    if (error) throw error;
    updateState({ session: data.session, user: data.user });
    if (data.user) {
      const initialProfile: Profile = {
        full_name: '',
        avatar_url: '',
        website: '',
        examBoard: DEFAULT_EXAM_BOARD,
        study_subjects: [],
        preferred_language: 'en'
      };
      await setAuthProfile(initialProfile);
    }
    navigate('/athro-onboarding');
  } catch (error: any) {
    updateState({ error: error.message });
    throw error;
  } finally {
    updateState({ isLoading: false });
  }
};

export const signOutAction = async (updateState: any, navigate: any) => {
  updateState({ isLoading: true });
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    updateState({ session: null, user: null, profile: null });
    navigate('/login');
  } catch (error: any) {
    toast({
      title: "Could not sign out",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    updateState({ isLoading: false });
  }
};

export const updateUserAction = async (
  data: UserUpdateData,
  state: AuthState,
  setAuthProfile: any,
  updateState: any,
) => {
  updateState({ isLoading: true });
  try {
    if (data.displayName && state.profile) {
      await setAuthProfile({ ...state.profile, full_name: data.displayName });
    }
    if (data.examBoard && state.profile) {
      await setAuthProfile({ ...state.profile, examBoard: data.examBoard });
    }
    if (data.email || data.password) {
      const updates: { email?: string; password?: string } = {};
      if (data.email) updates.email = data.email;
      if (data.password) updates.password = data.password;
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
    }
    toast({ title: "Account updated", description: "Your account has been updated successfully." });
  } catch (error: any) {
    toast({ title: "Update failed", description: error.message, variant: "destructive" });
  } finally {
    updateState({ isLoading: false });
  }
};
