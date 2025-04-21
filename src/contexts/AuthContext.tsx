
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ExamBoard } from '@/types/athro';

import { loginAction, signupAction, signOutAction, updateUserAction } from './authActions';
import { getProfileByUserId, upsertProfile } from './authProfile';
import { Profile, AuthState, UserUpdateData } from './authTypes';

interface AuthContextType {
  state: AuthState;
  setAuthProfile: (profile: Profile) => void;
  getProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: UserUpdateData) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  state: {
    session: null,
    user: null,
    profile: null,
    isLoading: false,
  },
  setAuthProfile: () => {},
  getProfile: async () => {},
  signOut: async () => {},
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  updateUser: async () => {},
  isLoading: false,
});

export const useAuth = () => useContext(AuthContext);

export const DEFAULT_EXAM_BOARD: ExamBoard = 'AQA';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    isLoading: true,
  });
  const navigate = useNavigate();

  const updateState = (updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    let mounted = true;
    const getInitialSession = async () => {
      updateState({ isLoading: true });

      try {
        if (localStorage.getItem('athro_user')) {
          try {
            const mockUser = JSON.parse(localStorage.getItem('athro_user') || '{}');
            if (mockUser.id) {
              if (mounted) {
                updateState({
                  user: mockUser,
                  isLoading: false
                });
              }
              return;
            }
          } catch (e) {}
        }
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        if (mounted) {
          updateState({
            session: session,
            user: session?.user ?? null
          });
          if (session?.user) {
            await getProfile();
          }
        }
      } catch {
        if (mounted) {
          updateState({ isLoading: false });
        }
      } finally {
        if (mounted) {
          updateState({ isLoading: false });
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        updateState({
          session: session,
          user: session?.user ?? null
        });
        if (session?.user) {
          setTimeout(() => {
            if (mounted) getProfile();
          }, 0);
        }
      }
    });

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const getProfile = async () => {
    if (!state.user) {
      updateState({ profile: null });
      return;
    }
    updateState({ isLoading: true });
    try {
      const profile = await getProfileByUserId(state.user.id);
      updateState({ profile });
    } catch (error: any) {
      if (error.code !== 'PGRST116') {
        toast({
          title: "Could not load profile",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      updateState({ isLoading: false });
    }
  };

  const setAuthProfile = async (profile: Profile) => {
    updateState({ isLoading: true });
    try {
      if (!state.user) throw new Error("User not authenticated.");
      await upsertProfile(profile, state.user.id);
      updateState({ profile });
      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Could not update profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      updateState({ isLoading: false });
    }
  };

  const login = (email: string, password: string, rememberMe = true) =>
    loginAction(email, password, rememberMe, updateState, getProfile, navigate);

  const signup = (email: string, password: string, role = 'student') =>
    signupAction(email, password, role, updateState, navigate, setAuthProfile);

  const updateUser = (data: UserUpdateData) =>
    updateUserAction(data, state, setAuthProfile, updateState);

  const signOut = () => signOutAction(updateState, navigate);

  const logout = signOut;

  const value = {
    state,
    setAuthProfile,
    getProfile,
    signOut,
    login,
    signup,
    logout,
    updateUser,
    isLoading: state.isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

