import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/auth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ExamBoard } from '@/types/athro';

interface AuthContextType {
  state: {
    session: any | null;
    user: any | null;
    profile: Profile | null;
    isLoading: boolean;
  };
  setAuthProfile: (profile: Profile) => void;
  getProfile: () => Promise<void>;
  signOut: () => Promise<void>;
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
  isLoading: false,
});

export const useAuth = () => useContext(AuthContext);

// Add this new constant
export const DEFAULT_EXAM_BOARD: ExamBoard = 'AQA';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
    
  const navigate = useNavigate();

  useEffect(() => {
    const getInitialSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await getProfile();
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await getProfile();
      }
    });
  }, []);
  
  const getProfile = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        console.warn("No user to fetch profile for.");
        setProfile(null);
        return;
      }
      
      let { data: profile, error, status } = await supabase
        .from('profiles')
        .select(`full_name, avatar_url, website, examBoard, study_subjects, preferred_language`)
        .eq('id', user.id)
        .single()

      if (error && status !== 406) {
        throw error;
      }
      
      setProfile({
        full_name: profile?.full_name || '',
        avatar_url: profile?.avatar_url || '',
        website: profile?.website || '',
        examBoard: profile?.examBoard || DEFAULT_EXAM_BOARD,
        study_subjects: profile?.study_subjects || [],
        preferred_language: profile?.preferred_language || 'en'
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Could not load profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setAuthProfile = async (profile: Profile) => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error("User not authenticated.");
      }

      const updates = {
        id: user.id,
        updated_at: new Date(),
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        website: profile.website,
        examBoard: profile.examBoard || DEFAULT_EXAM_BOARD,
        study_subjects: profile.study_subjects,
        preferred_language: profile.preferred_language,
      }

      let { error } = await supabase.from('profiles').upsert(updates, {
        returning: 'minimal', // Do not return the value after inserting
      })

      if (error) {
        throw error;
      }
      
      setProfile(profile);
      
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
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setSession(null);
      setUser(null);
      setProfile(null);
      
      navigate('/login');
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        title: "Could not sign out",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const value = {
    state: { session, user, profile, isLoading },
    setAuthProfile,
    getProfile,
    signOut,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
