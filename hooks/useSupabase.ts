import { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

/**
 * Hook para usar Supabase com real-time
 */

interface UseSupabaseOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  onData?: (data: any) => void;
}

export const useSupabaseRealtimeList = <T,>(table: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: fetchedData, error: fetchError } = await supabase
          .from(table)
          .select('*');

        if (fetchError) throw fetchError;
        setData(fetchedData || []);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe para real-time updates
    const channel: RealtimeChannel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        (payload) => {
          // Recarregar dados quando há mudanças
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table]);

  return { data, loading, error, refetch: () => {} };
};

/**
 * Hook para usar um item específico do Supabase
 */
export const useSupabaseItem = <T,>(table: string, id: string | null) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: fetchedData, error: fetchError } = await supabase
          .from(table)
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        setData(fetchedData);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar item';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [table, id]);

  return { data, loading, error };
};

/**
 * Hook para mutações (criar, atualizar, deletar)
 */
export const useSupabaseMutation = (table: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insert = async (payload: any) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: insertError } = await supabase
        .from(table)
        .insert([payload])
        .select()
        .single();

      if (insertError) throw insertError;
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao inserir';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, payload: any) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: updateError } = await supabase
        .from(table)
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const delete_ = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { insert, update, delete: delete_, loading, error };
};
