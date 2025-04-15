
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Valid Supabase table names - including our new tables
export const validTableNames = [
  'ai_logs', 'athro_characters', 'calendar_events', 'feedback',
  'model_answers', 'past_papers', 'profiles', 'quiz_results',
  'schools', 'sets', 'student_sets', 'task_submissions',
  'tasks', 'uploads', 'recall_entries', 'study_sessions'
] as const;

export type ValidTableName = typeof validTableNames[number];

type SimpleFilter = Record<string, any>;

interface SupabaseQueryOptions {
  select?: string;
  filter?: SimpleFilter;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  single?: boolean;
  enabled?: boolean;
}

/**
 * A custom hook for querying Supabase data
 */
export function useSupabaseQuery<T = any>(
  tableName: ValidTableName,
  options: SupabaseQueryOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { state } = useAuth();

  const {
    select = '*',
    filter,
    order,
    limit,
    single = false,
    enabled = true,
  } = options;

  const fetchData = async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use type assertion to avoid infinite type recursion issues
      let query = supabase.from(tableName).select(select) as any;

      if (filter) {
        for (const [key, value] of Object.entries(filter)) {
          if (value === undefined || value === null) continue;

          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (typeof value === 'object' && 'gte' in value) {
            query = query.gte(key, value.gte);
          } else if (typeof value === 'object' && 'lte' in value) {
            query = query.lte(key, value.lte);
          } else if (typeof value === 'object' && 'contains' in value) {
            query = query.contains(key, value.contains);
          } else {
            query = query.eq(key, value);
          }
        }
      }

      if (order) {
        query = query.order(order.column, { ascending: order.ascending ?? true });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const result = single 
        ? await query.maybeSingle() 
        : await query;

      if (result.error) throw result.error;
      setData(result.data as T);
    } catch (err: any) {
      console.error(`Error fetching data from ${tableName}:`, err);
      setError(new Error(err.message || 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.user && enabled) {
      fetchData();
    }
  }, [state.user, JSON.stringify(options), enabled]);

  return { data, loading, error, refetch: fetchData };
}

type SupabaseRealtimeOptions = {
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: Record<string, any>;
  initialData?: any[];
};

/**
 * A custom hook for real-time Supabase subscriptions
 */
export function useSupabaseRealtime<T = any>(
  tableName: ValidTableName,
  options: SupabaseRealtimeOptions = {}
) {
  const [data, setData] = useState<T[]>(options.initialData || []);
  const { state } = useAuth();

  useEffect(() => {
    if (!state.user) return;

    const fetchInitialData = async () => {
      try {
        // Use type assertion to break potential infinite type recursion
        let query = supabase.from(tableName).select('*') as any;

        if (options.filter) {
          for (const [key, value] of Object.entries(options.filter)) {
            if (value === undefined || value === null) continue;
            query = query.eq(key, value);
          }
        }

        const { data: initialData, error } = await query;
        if (error) throw error;
        if (initialData) {
          setData(initialData as T[]);
        }
      } catch (error) {
        console.error(`Error fetching initial data from ${tableName}:`, error);
      }
    };

    fetchInitialData();

    // Create a channel for realtime updates
    const channel = supabase.channel(`realtime:${tableName}`);
    
    // Using ts-ignore to bypass TypeScript's type checking for the Supabase realtime API
    // @ts-ignore - Supabase's typings are causing the infinite recursion
    channel.on('postgres_changes', {
      event: options.event || '*',
      schema: 'public',
      table: tableName,
    }, (payload: any) => {
      const newRow = payload.new as T;
      const oldRow = payload.old as T;

      switch (payload.eventType) {
        case 'INSERT':
          setData(prev => [...prev, newRow]);
          break;
        case 'UPDATE':
          setData(prev => prev.map(item => ((item as any).id === (newRow as any).id ? newRow : item)));
          break;
        case 'DELETE':
          setData(prev => prev.filter(item => (item as any).id !== (oldRow as any).id));
          break;
      }
    }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state.user, tableName, JSON.stringify(options)]);

  return { data };
}

export default useSupabaseQuery;
