import { supabase } from '../lib/supabase';
import { Parecer } from '../types';

export const pareceresService = {
  async getAll(pacienteId: string): Promise<Parecer[]> {
    const { data, error } = await supabase
      .from('pareceres_pacientes')
      .select('*')
      .eq('paciente_id', pacienteId)
      .is('archived_at', null)
      .order('data_parecer', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(
    pacienteId: string,
    payload: { especialista: string; data_parecer: string; parecer?: string | null },
    userId?: string | null,
  ): Promise<Parecer> {
    const { data, error } = await supabase
      .from('pareceres_pacientes')
      .insert([{ paciente_id: pacienteId, ...payload, created_by: userId ?? null }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    payload: { especialista?: string; data_parecer?: string; parecer?: string | null },
    userId?: string | null,
  ): Promise<void> {
    const { error } = await supabase
      .from('pareceres_pacientes')
      .update({ ...payload, updated_by: userId ?? null })
      .eq('id', id);
    if (error) throw error;
  },

  async archive(id: string, motivo: string, userId?: string | null): Promise<void> {
    const { error } = await supabase
      .from('pareceres_pacientes')
      .update({
        archived_at: new Date().toISOString(),
        motivo_arquivamento: motivo,
        updated_by: userId ?? null,
      })
      .eq('id', id);
    if (error) throw error;
  },
};
