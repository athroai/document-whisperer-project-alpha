
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Define a type for valid table names in our Supabase database
type ValidTableName = 'ai_logs' | 'athro_characters' | 'calendar_events' | 
  'feedback' | 'model_answers' | 'past_papers' | 'profiles' | 'quiz_results' | 
  'schools' | 'sets' | 'student_sets' | 'task_submissions' | 'tasks' | 'uploads';

// Define a simpler filter type without recursive structures
type SimpleFilter = Record<string, any>;

/**
 * A custom hook for making Supabase queries with loading and error handling
 */
export function useSupabaseQuery<T = any>(
  tableName: ValidTableName,
  options: {
    select?: string;
    filter?: SimpleFilter;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    single?: boolean;
    enabled?: boolean;
  } = {}
) {
  // Use explicit state types to avoid recursion
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
    enabled = true
  } = options;
  
  // Create fetchData as a non-generic function to avoid deep type recursion
  const fetchData = async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create the query
      let query = supabase
        .from(tableName)
        .select(select);
        
      // Apply filters if provided
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
      
      // Apply ordering if provided
      if (order) {
        query = query.order(order.column, { ascending: order.ascending ?? true });
      }
      
      // Apply limit if provided
      if (limit) {
        query = query.limit(limit);
      }
      
      // Execute the query without deep generic inference
      if (single) {
        const result = await query.maybeSingle();
        if (result.error) throw result.error;
        // Use non-generic type assertion to break recursion
        setData(result.data as any);
      } else {
        const result = await query;
        if (result.error) throw result.error;
        // Use non-generic type assertion to break recursion
        setData(result.data as any);
      }
    } catch (err: any) {
      console.error(`Error fetching data from ${tableName}:`, err);
      setError(new Error(err.message || 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (state.user || !options.enabled) {
      fetchData();
    }
  }, [state.user, JSON.stringify(options), enabled]);
  
  return { data, loading, error, refetch: fetchData };
}

/**
 * A custom hook for real-time subscriptions to Supabase tables
 */
export function useSupabaseRealtime<T = any>(
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
    
    // Fetch initial data
    const fetchInitialData = async () => {
      try {
        let query = supabase
          .from(tableName)
          .select('*');
        
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
    
    // Create channel without type checking to avoid the system/postgres_changes mismatch
    // @ts-ignore - We know at runtime this works, it's just a TypeScript definition issue
    const channel = supabase.channel(`table-changes-${tableName}`);
    
    // Add subscription with explicit any to avoid type issues
    // @ts-ignore - This bypasses the type system's limitation with Supabase's realtime API
    channel.on(
      'postgres_changes', 
      {
        event: options.event || '*',
        schema: 'public',
        table: tableName,
      },
      (payload: any) => {
        // Handle different event types
        if (payload.eventType === 'INSERT') {
          setData(prevData => [...prevData, payload.new as T]);
        } else if (payload.eventType === 'UPDATE') {
          setData(prevData => 
            prevData.map(item => 
              // Safely compare IDs without assuming object shape
              (item as any).id === (payload.new as any).id ? payload.new as T : item
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setData(prevData => 
            prevData.filter(item => 
              // Safely compare IDs without assuming object shape
              (item as any).id !== (payload.old as any).id
            )
          );
        }
      }
    ).subscribe();
    
    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [state.user, tableName, JSON.stringify(options)]);
  
  return { data };
}

export default useSupabaseQuery;
