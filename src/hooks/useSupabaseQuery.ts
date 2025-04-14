import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Valid Supabase table names
export const validTableNames = [
  'ai_logs', 'athro_characters', 'calendar_events', 'feedback',
  'model_answers', 'past_papers', 'profiles', 'quiz_results',
  'schools', 'sets', 'student_sets', 'task_submissions',
  'tasks', 'uploads'
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
export function useSupabaseQuery<T>(
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
      let query = supabase.from(tableName).select(select);

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

      if (single) {
        const result = await query.maybeSingle();
        if (result.error) throw result.error;
        setData(result.data as T);
      } else {
        const result = await query;
        if (result.error) throw result.error;
        setData(result.data as T);
      }
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

/**
 * A custom hook for real-time Supabase subscriptions
 */
export function useSupabaseRealtime<T>(
  tableName: ValidTableName,
  options: {
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    filter?: Record<string, any>;
    initialData?: T[];
  } = {}
) {
  const [data, setData] = useState<T[]>(options.initialData || []);
  const { state } = useAuth();

  useEffect(() => {
    if (!state.user) return;

    const fetchInitialData = async () => {
      try {
        let query = supabase.from(tableName).select('*');

        if (options.filter) {
          for (const [key, value] of Object.entries(options.filter)) {
            if (value === undefined || value === null) continue;
            query = query.eq(key, value);
          }
        }

        const { data: initialData } = await query;
        if (initialData) {
          setData(initialData as T[]);
        }
      } catch (error) {
        console.error(`Error fetching initial data from ${tableName}:`, error);
      }
    };

    fetchInitialData();

    const channel = supabase.channel(`realtime:${tableName}`).on(
      'postgres_changes',
      {
        event: options.event || '*',
        schema: 'public',
        table: tableName,
      },
      (payload: RealtimePostgresChangesPayload<any>) => {
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
      }
    ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state.user, tableName, JSON.stringify(options)]);

  return { data };
}

export default useSupabaseQuery;
