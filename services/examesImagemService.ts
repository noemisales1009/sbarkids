import { supabase } from '../lib/supabase';
import { ExameImagem } from '../types';

export const examesImagemService = {
  async getAll(pacienteId: string): Promise<ExameImagem[]> {
    const { data, error } = await supabase
      .from('exames_imagem_pacientes')
      .select('*')
      .eq('paciente_id', pacienteId)
      .is('archived_at', null)
      .order('data_exame', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(
    pacienteId: string,
    payload: { categoria: string; exame: string; data_exame: string; resultado?: string | null },
    userId?: string | null,
  ): Promise<ExameImagem> {
    const { data, error } = await supabase
      .from('exames_imagem_pacientes')
      .insert([{ paciente_id: pacienteId, ...payload, created_by: userId ?? null }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    payload: { categoria?: string; exame?: string; data_exame?: string; resultado?: string | null },
    userId?: string | null,
  ): Promise<void> {
    const { error } = await supabase
      .from('exames_imagem_pacientes')
      .update({ ...payload, updated_by: userId ?? null })
      .eq('id', id);
    if (error) throw error;
  },

  async archive(id: string, motivo: string, userId?: string | null): Promise<void> {
    const { error } = await supabase
      .from('exames_imagem_pacientes')
      .update({
        archived_at: new Date().toISOString(),
        motivo_arquivamento: motivo,
        updated_by: userId ?? null,
      })
      .eq('id', id);
    if (error) throw error;
  },
};
