
import { supabase } from '@/lib/supabase';
import { Profile } from './authTypes';
import { DEFAULT_EXAM_BOARD } from './AuthContext';

export const getProfileByUserId = async (userId: string) => {
  let { data: profile, error, status } = await supabase
    .from('profiles')
    .select(`full_name, avatar_url, website, examBoard, study_subjects, preferred_language`)
    .eq('id', userId)
    .single();
  if (error && status !== 406) throw error;
  return {
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || '',
    website: profile?.website || '',
    examBoard: profile?.examBoard || DEFAULT_EXAM_BOARD,
    study_subjects: profile?.study_subjects || [],
    preferred_language: profile?.preferred_language || 'en'
  };
};

export const upsertProfile = async (profile: Profile, userId: string) => {
  const updates = {
    id: userId,
    updated_at: new Date(),
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    website: profile.website,
    examBoard: profile.examBoard || DEFAULT_EXAM_BOARD,
    study_subjects: profile.study_subjects,
    preferred_language: profile.preferred_language,
  }
  let { error } = await supabase.from('profiles').upsert(updates, { onConflict: 'id' });
  if (error) throw error;
  return updates;
};
