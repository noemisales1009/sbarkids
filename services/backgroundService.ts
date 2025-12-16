import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

// ============================================================================
// MEDICAÇÕES
// ============================================================================
export interface Medicacao {
  id: number;
  paciente_id: string;
  nome_medicacao: string;
  dosagem_valor: string;
  unidade_medida: string;
  data_inicio: string;
  data_fim: string | null;
  is_archived: boolean;
  created_at: string;
}

// ============================================================================
// DISPOSITIVOS
// ============================================================================
export interface Dispositivo {
  id: number;
  paciente_id: string;
  tipo_dispositivo: string;
  localizacao: string;
  data_insercao: string;
  data_remocao: string | null;
  is_archived: boolean;
  created_at: string;
}

// ============================================================================
// CULTURAS
// ============================================================================
export interface Cultura {
  id: number;
  paciente_id: string;
  local: string;
  microorganismo: string;
  data_coleta: string;
  is_archived: boolean;
  created_at: string;
}

// ============================================================================
// PROCEDIMENTOS
// ============================================================================
export interface Procedimento {
  id: number;
  paciente_id: string;
  nome_procedimento: string;
  data_procedimento: string;
  nome_cirurgiao: string | null;
  notas: string | null;
  is_archived: boolean;
  created_at: string;
}

// ============================================================================
// SERVIÇO UNIFICADO
// ============================================================================
export const backgroundService = {
  // ========== MEDICAÇÕES ==========
  async getMedicacoes(patientId: string): Promise<Medicacao[]> {
    try {
      const { data, error } = await supabase
        .from('medicacoes_pacientes')
        .select('*')
        .eq('paciente_id', patientId)
        .eq('is_archived', false)
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      return (data as Medicacao[]) || [];
    } catch (error) {
      logError(error, 'backgroundService.getMedicacoes');
      return [];
    }
  },

  async saveMedicacao(medicacao: Omit<Medicacao, 'id' | 'created_at'>): Promise<Medicacao | null> {
    try {
      const { data, error } = await supabase
        .from('medicacoes_pacientes')
        .insert(medicacao)
        .select()
        .single();

      if (error) throw error;
      return data as Medicacao;
    } catch (error) {
      logError(error, 'backgroundService.saveMedicacao');
      return null;
    }
  },

  async updateMedicacao(id: number, updates: Partial<Medicacao>): Promise<Medicacao | null> {
    try {
      const { data, error } = await supabase
        .from('medicacoes_pacientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Medicacao;
    } catch (error) {
      logError(error, 'backgroundService.updateMedicacao');
      return null;
    }
  },

  // ========== DISPOSITIVOS ==========
  async getDispositivos(patientId: string): Promise<Dispositivo[]> {
    try {
      const { data, error } = await supabase
        .from('dispositivos_pacientes')
        .select('*')
        .eq('paciente_id', patientId)
        .eq('is_archived', false)
        .order('data_insercao', { ascending: false });

      if (error) throw error;
      return (data as Dispositivo[]) || [];
    } catch (error) {
      logError(error, 'backgroundService.getDispositivos');
      return [];
    }
  },

  async saveDispositivo(dispositivo: Omit<Dispositivo, 'id' | 'created_at'>): Promise<Dispositivo | null> {
    try {
      const { data, error } = await supabase
        .from('dispositivos_pacientes')
        .insert(dispositivo)
        .select()
        .single();

      if (error) throw error;
      return data as Dispositivo;
    } catch (error) {
      logError(error, 'backgroundService.saveDispositivo');
      return null;
    }
  },

  async updateDispositivo(id: number, updates: Partial<Dispositivo>): Promise<Dispositivo | null> {
    try {
      const { data, error } = await supabase
        .from('dispositivos_pacientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Dispositivo;
    } catch (error) {
      logError(error, 'backgroundService.updateDispositivo');
      return null;
    }
  },

  // ========== CULTURAS ==========
  async getCulturas(patientId: string): Promise<Cultura[]> {
    try {
      const { data, error } = await supabase
        .from('culturas_pacientes')
        .select('*')
        .eq('paciente_id', patientId)
        .eq('is_archived', false)
        .order('data_coleta', { ascending: false });

      if (error) throw error;
      return (data as Cultura[]) || [];
    } catch (error) {
      logError(error, 'backgroundService.getCulturas');
      return [];
    }
  },

  async saveCultura(cultura: Omit<Cultura, 'id' | 'created_at'>): Promise<Cultura | null> {
    try {
      const { data, error } = await supabase
        .from('culturas_pacientes')
        .insert(cultura)
        .select()
        .single();

      if (error) throw error;
      return data as Cultura;
    } catch (error) {
      logError(error, 'backgroundService.saveCultura');
      return null;
    }
  },

  async updateCultura(id: number, updates: Partial<Cultura>): Promise<Cultura | null> {
    try {
      const { data, error } = await supabase
        .from('culturas_pacientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Cultura;
    } catch (error) {
      logError(error, 'backgroundService.updateCultura');
      return null;
    }
  },

  // ========== PROCEDIMENTOS ==========
  async getProcedimentos(patientId: string): Promise<Procedimento[]> {
    try {
      const { data, error } = await supabase
        .from('procedimentos_pacientes')
        .select('*')
        .eq('paciente_id', patientId)
        .eq('is_archived', false)
        .order('data_procedimento', { ascending: false });

      if (error) throw error;
      return (data as Procedimento[]) || [];
    } catch (error) {
      logError(error, 'backgroundService.getProcedimentos');
      return [];
    }
  },

  async saveProcedimento(procedimento: Omit<Procedimento, 'id' | 'created_at'>): Promise<Procedimento | null> {
    try {
      const { data, error } = await supabase
        .from('procedimentos_pacientes')
        .insert(procedimento)
        .select()
        .single();

      if (error) throw error;
      return data as Procedimento;
    } catch (error) {
      logError(error, 'backgroundService.saveProcedimento');
      return null;
    }
  },

  async updateProcedimento(id: number, updates: Partial<Procedimento>): Promise<Procedimento | null> {
    try {
      const { data, error } = await supabase
        .from('procedimentos_pacientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Procedimento;
    } catch (error) {
      logError(error, 'backgroundService.updateProcedimento');
      return null;
    }
  }
};
