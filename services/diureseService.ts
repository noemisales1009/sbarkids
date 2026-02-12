import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

// ============================================================================
// DIURESE
// ============================================================================
export interface Diurese {
  id: number;
  patient_id: string;
  volume: number;
  peso: number;
  horas: number;
  resultado: number; // Gerado automaticamente: (volume / horas) / peso
  data_registro: string;
}

export const diureseService = {
  // Buscar diurese de um paciente
  async getDiurese(patientId: string): Promise<Diurese[]> {
    try {
      const { data, error } = await supabase
        .from('diurese')
        .select('*')
        .eq('patient_id', patientId)
        .order('data_registro', { ascending: false });

      if (error) throw error;
      return (data as Diurese[]) || [];
    } catch (error) {
      logError(error, 'diureseService.getDiurese');
      return [];
    }
  },

  // Salvar nova diurese
  async saveDiurese(
    diurese: Omit<Diurese, 'id' | 'data_registro' | 'resultado'>
  ): Promise<Diurese | null> {
    try {
      const { data, error } = await supabase
        .from('diurese')
        .insert(diurese)
        .select()
        .single();

      if (error) throw error;
      return data as Diurese;
    } catch (error) {
      logError(error, 'diureseService.saveDiurese');
      return null;
    }
  },

  // Atualizar diurese
  async updateDiurese(
    id: number,
    updates: Partial<Diurese>
  ): Promise<Diurese | null> {
    try {
      const { data, error } = await supabase
        .from('diurese')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Diurese;
    } catch (error) {
      logError(error, 'diureseService.updateDiurese');
      return null;
    }
  },

  // Excluir diurese
  async deleteDiurese(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('diurese')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      logError(error, 'diureseService.deleteDiurese');
      return false;
    }
  }
};
