import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile, AuthState, UserUpdateData } from '@/types/auth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ExamBoard } from '@/types/athro';

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
        // First check if we have a mock user for development
        if (localStorage.getItem('athro_user')) {
          try {
            const mockUser = JSON.parse(localStorage.getItem('athro_user') || '{}');
            if (mockUser.id) {
              console.log('Using mock user authentication');
              // Only update if component is still mounted
              if (mounted) {
                updateState({ 
                  user: mockUser,
                  isLoading: false 
                });
              }
              return;
            }
          } catch (e) {
            console.warn('Invalid mock user in localStorage');
          }
        }
        
        // Get session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting initial session:", error);
          throw error;
        }

        // Only update if component is still mounted
        if (mounted) {
          updateState({ 
            session: session,
            user: session?.user ?? null
          });
          
          if (session?.user) {
            await getProfile();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          updateState({ isLoading: false });
        }
      } finally {
        if (mounted) {
          updateState({ isLoading: false });
        }
      }
    };

    // Set up auth state change listener first to avoid race conditions
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (mounted) {
        updateState({
          session: session,
          user: session?.user ?? null
        });
        
        if (session?.user) {
          // Use setTimeout to defer profile fetch to avoid potential deadlocks
          setTimeout(() => {
            if (mounted) getProfile();
          }, 0);
        }
      }
    });

    // Then get the initial session
    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  
  const getProfile = async () => {
    if (!state.user) {
      console.warn("No user to fetch profile for.");
      updateState({ profile: null });
      return;
    }
    
    updateState({ isLoading: true });
    try {
      console.log("Fetching profile for user:", state.user.id);
      
      let { data: profile, error, status } = await supabase
        .from('profiles')
        .select(`full_name, avatar_url, website, examBoard, study_subjects, preferred_language`)
        .eq('id', state.user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }
      
      updateState({
        profile: {
          full_name: profile?.full_name || '',
          avatar_url: profile?.avatar_url || '',
          website: profile?.website || '',
          examBoard: profile?.examBoard || DEFAULT_EXAM_BOARD,
          study_subjects: profile?.study_subjects || [],
          preferred_language: profile?.preferred_language || 'en'
        }
      });
      
      console.log("Profile fetched successfully");
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      // Only show toast for non-404 errors
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
      if (!state.user) {
        throw new Error("User not authenticated.");
      }

      const updates = {
        id: state.user.id,
        updated_at: new Date(),
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        website: profile.website,
        examBoard: profile.examBoard || DEFAULT_EXAM_BOARD,
        study_subjects: profile.study_subjects,
        preferred_language: profile.preferred_language,
      }

      let { error } = await supabase.from('profiles').upsert(updates, {
        onConflict: 'id'
      });

      if (error) {
        throw error;
      }
      
      updateState({ profile });
      
      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Could not update profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      updateState({ isLoading: false });
    }
  };

  const login = async (email: string, password: string, rememberMe = true) => {
    updateState({ isLoading: true, error: undefined });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      updateState({
        session: data.session, 
        user: data.user
      });
      
      await getProfile();
      navigate('/home');
    } catch (error: any) {
      console.error("Error logging in:", error);
      updateState({ error: error.message });
      throw error;
    } finally {
      updateState({ isLoading: false });
    }
  };
  
  const signup = async (email: string, password: string, role = 'student') => {
    updateState({ isLoading: true, error: undefined });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role
          }
        }
      });
      
      if (error) throw error;
      
      updateState({
        session: data.session, 
        user: data.user
      });
      
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
      console.error("Error signing up:", error);
      updateState({ error: error.message });
      throw error;
    } finally {
      updateState({ isLoading: false });
    }
  };

  const updateUser = async (data: UserUpdateData) => {
    updateState({ isLoading: true });
    try {
      if (data.displayName && state.profile) {
        await setAuthProfile({
          ...state.profile,
          full_name: data.displayName
        });
      }
      
      if (data.examBoard && state.profile) {
        await setAuthProfile({
          ...state.profile,
          examBoard: data.examBoard
        });
      }
      
      if (data.email || data.password) {
        const updates: { email?: string, password?: string } = {};
        if (data.email) updates.email = data.email;
        if (data.password) updates.password = data.password;
        
        const { error } = await supabase.auth.updateUser(updates);
        if (error) throw error;
      }
      
      toast({
        title: "Account updated",
        description: "Your account has been updated successfully."
      });
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      updateState({ isLoading: false });
    }
  };

  const signOut = async () => {
    updateState({ isLoading: true });
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      updateState({
        session: null,
        user: null,
        profile: null
      });
      
      navigate('/login');
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        title: "Could not sign out",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      updateState({ isLoading: false });
    }
  };
  
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
