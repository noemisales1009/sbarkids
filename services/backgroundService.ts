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
  observacao: string | null;
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
  observacao: string | null;
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
  observacao: string | null;
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
// EXAMES
// ============================================================================
export interface Exame {
  id: number;
  paciente_id: string;
  nome_exame: string;
  data_exame: string;
  observacao: string | null;
  is_archived: boolean;
  created_at: string;
}

// ============================================================================
// DIETAS
// ============================================================================
export interface Dieta {
  id: string;
  paciente_id: string;
  tipo: string;
  data_inicio: string;
  volume: number | null;
  vet: number | null;
  pt: number | null;
  th: number | null;
  vet_pleno: number | null;
  pt_g_dia: number | null;
  vet_at: number | null; // calculado
  pt_at: number | null; // calculado
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  data_remocao: string | null;
  observacao: string | null;
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
      throw error;
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

      if (error) {
        throw error;
      }
      
      return data as Medicacao;
    } catch (error) {
      logError(error, 'backgroundService.updateMedicacao');
      throw error;
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

      if (error) {
        throw error;
      }
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

      if (error) {
        throw error;
      }
      return data as Dispositivo;
    } catch (error) {
      logError(error, 'backgroundService.saveDispositivo');
      throw error;
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

      if (error) {
        throw error;
      }
      
      return data as Dispositivo;
    } catch (error) {
      logError(error, 'backgroundService.updateDispositivo');
      throw error;
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
      throw error;
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

      if (error) {
        throw error;
      }
      
      return data as Cultura;
    } catch (error) {
      logError(error, 'backgroundService.updateCultura');
      throw error;
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
      throw error;
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

      if (error) {
        throw error;
      }
      
      return data as Procedimento;
    } catch (error) {
      logError(error, 'backgroundService.updateProcedimento');
      throw error;
    }
  },

  // ========== EXAMES ==========
  async getExames(patientId: string): Promise<Exame[]> {
    try {
      const { data, error } = await supabase
        .from('exames_pacientes')
        .select('*')
        .eq('paciente_id', patientId)
        .eq('is_archived', false)
        .order('data_exame', { ascending: false });

      if (error) throw error;
      return (data as Exame[]) || [];
    } catch (error) {
      logError(error, 'backgroundService.getExames');
      return [];
    }
  },

  async saveExame(exame: Omit<Exame, 'id' | 'created_at'>): Promise<Exame | null> {
    try {
      
      const { data, error } = await supabase
        .from('exames_pacientes')
        .insert(exame)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return data as Exame;
    } catch (error) {
      logError(error, 'backgroundService.saveExame');
      throw error;
    }
  },

  async updateExame(id: number, updates: Partial<Exame>): Promise<Exame | null> {
    try {
      
      const { data, error } = await supabase
        .from('exames_pacientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return data as Exame;
    } catch (error) {
      logError(error, 'backgroundService.updateExame');
      throw error;
    }
  },

  async deleteExame(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('exames_pacientes')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      logError(error, 'backgroundService.deleteExame');
      return false;
    }
  },

  // ========== DIETAS ==========
  async getDietas(patientId: string): Promise<Dieta[]> {
    try {
      const { data, error } = await supabase
        .from('dietas_pacientes')
        .select('*')
        .eq('paciente_id', patientId)
        .eq('is_archived', false)
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      return (data as Dieta[]) || [];
    } catch (error) {
      logError(error, 'backgroundService.getDietas');
      return [];
    }
  },

  async saveDieta(dieta: Omit<Dieta, 'id' | 'created_at' | 'updated_at' | 'vet_at' | 'pt_at'>): Promise<Dieta | null> {
    try {
      const { data, error } = await supabase
        .from('dietas_pacientes')
        .insert(dieta)
        .select()
        .single();

      if (error) throw error;
      return data as Dieta;
    } catch (error) {
      logError(error, 'backgroundService.saveDieta');
      throw error;
    }
  },

  async updateDieta(id: string, updates: Partial<Dieta>): Promise<Dieta | null> {
    try {
      
      const { data, error } = await supabase
        .from('dietas_pacientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return data as Dieta;
    } catch (error) {
      logError(error, 'backgroundService.updateDieta');
      throw error;
    }
  }
};
