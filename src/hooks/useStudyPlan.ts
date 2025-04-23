
import { useEffect, useState } from 'react';
import { PreferredStudySlot } from '@/types/study';
import { supabase } from '@/lib/supabase';
import { objectToSnakeCase } from '@/utils/formatters';

export const useStudyPlan = () => {
  const generateDefaultSlots = (userId: string): PreferredStudySlot[] => {
    return [{
      id: crypto.randomUUID(),
      user_id: userId,
      day_of_week: 1,
      slot_count: 2,
      slot_duration_minutes: 30,
      preferred_start_hour: 9,
      subject: 'Mathematics',
      created_at: new Date().toISOString()
    }];
  };

  const saveStudySlots = async (slots: PreferredStudySlot[]) => {
    const { error } = await supabase
      .from('preferred_study_slots')
      .insert(slots.map(slot => objectToSnakeCase(slot)));
    
    return { error };
  };

  return { generateDefaultSlots, saveStudySlots };
};
