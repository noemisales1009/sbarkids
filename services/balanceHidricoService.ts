import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

// ============================================================================
// BALANÇO HÍDRICO
// ============================================================================
export interface BalancoHidrico {
  id: number;
  patient_id: string;
  volume: number;
  peso: number;
  resultado: number; // Gerado automaticamente: volume / (peso * 10.0)
  data_registro: string;
  created_at: string;
  created_by: string | null;
}

export const balanceHidricoService = {
  // Buscar balanço hídrico de um paciente
  async getBalanceHidrico(patientId: string): Promise<BalancoHidrico[]> {
    try {
      const { data, error } = await supabase
        .from('balanco_hidrico')
        .select('*')
        .eq('patient_id', patientId)
        .order('data_registro', { ascending: false });

      if (error) throw error;
      return (data as BalancoHidrico[]) || [];
    } catch (error) {
      logError(error, 'balanceHidricoService.getBalanceHidrico');
      return [];
    }
  },

  // Salvar novo balanço hídrico
  async saveBalanceHidrico(
    balanceHidrico: Omit<BalancoHidrico, 'id' | 'created_at' | 'resultado' | 'created_by'>
  ): Promise<BalancoHidrico | null> {
    try {
      const { data, error } = await supabase
        .from('balanco_hidrico')
        .insert(balanceHidrico)
        .select()
        .single();

      if (error) throw error;
      return data as BalancoHidrico;
    } catch (error) {
      logError(error, 'balanceHidricoService.saveBalanceHidrico');
      throw error;
    }
  },

  // Atualizar balanço hídrico
  async updateBalanceHidrico(
    id: number,
    updates: Partial<BalancoHidrico>
  ): Promise<BalancoHidrico | null> {
    try {
      const { data, error } = await supabase
        .from('balanco_hidrico')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as BalancoHidrico;
    } catch (error) {
      logError(error, 'balanceHidricoService.updateBalanceHidrico');
      throw error;
    }
  },

  // Excluir balanço hídrico
  async deleteBalanceHidrico(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('balanco_hidrico')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      logError(error, 'balanceHidricoService.deleteBalanceHidrico');
      return false;
    }
  }
};
