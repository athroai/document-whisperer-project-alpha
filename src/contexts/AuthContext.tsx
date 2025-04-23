
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ExamBoard } from '@/types/athro';
import { AuthUser, UserRole } from '@/types/index';

interface Profile {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  exam_board?: ExamBoard;
  preferred_language?: string;
  confidence_scores?: Record<string, number>;
  school_id?: string;
  welsh_eligible?: boolean;
  created_at?: string;
}

interface UserUpdateData {
  name?: string;
  exam_board?: ExamBoard;
  preferred_language?: string;
  confidence_scores?: Record<string, number>;
}

interface AuthState {
  session: any | null;
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
}

interface AuthContextType {
  state: AuthState;
  setAuthProfile: (profile: Profile) => Promise<void>;
  getProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: UserUpdateData) => Promise<void>;
  isLoading: boolean;
}

export const DEFAULT_EXAM_BOARD: ExamBoard = 'AQA';

const AuthContext = createContext<AuthContextType>({
  state: {
    session: null,
    user: null,
    profile: null,
    isLoading: false,
  },
  setAuthProfile: async () => {},
  getProfile: async () => {},
  signOut: async () => {},
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  updateUser: async () => {},
  isLoading: false,
});

export const useAuth = () => useContext(AuthContext);

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
  const { toast } = useToast();
  const navigate = useNavigate();

  const updateState = (updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    let mounted = true;
    const getInitialSession = async () => {
      updateState({ isLoading: true });

      try {
        // Check for mock user in development mode
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
          } catch (e) {
            console.error("Error parsing mock user:", e);
          }
        }

        // Get session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (mounted) {
          updateState({
            session: session,
            user: session?.user ? {
              id: session.user.id,
              email: session.user.email || '',
              displayName: session.user.user_metadata?.name
            } : null
          });
          
          if (session?.user) {
            await getProfile();
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        if (mounted) {
          updateState({ isLoading: false });
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        updateState({
          session: session,
          user: session?.user ? {
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.name
          } : null
        });
        
        if (session?.user) {
          // Use setTimeout to avoid potential auth state deadlocks
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', state.user.id)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // Record not found error
          throw error;
        }
        updateState({ profile: null });
      } else {
        updateState({ 
          profile: data,
          user: {
            ...state.user,
            role: data.role
          }
        });
      }
    } catch (error: any) {
      toast({
        title: "Could not load profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      updateState({ isLoading: false });
    }
  };

  const setAuthProfile = async (profile: Profile) => {
    updateState({ isLoading: true });
    
    try {
      if (!state.user) throw new Error("User not authenticated.");
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: state.user.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          exam_board: profile.exam_board,
          preferred_language: profile.preferred_language,
          confidence_scores: profile.confidence_scores,
          school_id: profile.school_id,
          welsh_eligible: profile.welsh_eligible
        });
      
      if (error) throw error;
      
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

  const login = async (email: string, password: string, rememberMe = true) => {
    updateState({ isLoading: true });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      updateState({
        session: data.session,
        user: data.user ? {
          id: data.user.id,
          email: data.user.email || '',
          displayName: data.user.user_metadata?.name
        } : null
      });
      
      if (data.user) {
        await getProfile();
      }
      
      navigate('/home');
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      updateState({ isLoading: false });
    }
  };

  const signup = async (email: string, password: string, role = 'student') => {
    updateState({ isLoading: true });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
          }
        }
      });
      
      if (error) throw error;
      
      updateState({
        session: data.session,
        user: data.user ? {
          id: data.user.id,
          email: data.user.email || '',
          displayName: data.user.email.split('@')[0],
          role
        } : null
      });
      
      if (data.user) {
        // Create a profile for the new user
        await setAuthProfile({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.email.split('@')[0],
          role: role as UserRole,
          exam_board: DEFAULT_EXAM_BOARD,
          preferred_language: 'en',
          confidence_scores: {}
        });
      }
      
      navigate('/onboarding');
      
      toast({
        title: "Account created",
        description: "Welcome to Athro!",
      });
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      updateState({ isLoading: false });
    }
  };

  const updateUser = async (data: UserUpdateData) => {
    if (!state.user || !state.profile) {
      toast({
        title: "Update failed",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }
    
    updateState({ isLoading: true });
    
    try {
      await setAuthProfile({
        ...state.profile,
        ...data
      });
      
      updateState({
        user: {
          ...state.user,
          displayName: data.name || state.user.displayName
        }
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      updateState({ isLoading: false });
    }
  };

  const signOut = async () => {
    updateState({ isLoading: true });
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      updateState({
        session: null,
        user: null,
        profile: null
      });
      
      navigate('/login');
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
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
