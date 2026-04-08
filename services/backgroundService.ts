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
      return null;
    }
  },

  async updateMedicacao(id: number, updates: Partial<Medicacao>): Promise<Medicacao | null> {
    try {
      console.log('🔄 UPDATE Medicação ID:', id, 'Dados:', updates);
      
      const { data, error } = await supabase
        .from('medicacoes_pacientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro Supabase update:', error);
        throw error;
      }
      
      console.log('✅ Medicação atualizada com sucesso:', data);
      return data as Medicacao;
    } catch (error) {
      console.error('❌ Erro ao atualizar medicação:', error);
      logError(error, 'backgroundService.updateMedicacao');
      return null;
    }
  },

  // ========== DISPOSITIVOS ==========
  async getDispositivos(patientId: string): Promise<Dispositivo[]> {
    try {
      console.log('Buscando dispositivos para paciente:', patientId);
      const { data, error } = await supabase
        .from('dispositivos_pacientes')
        .select('*')
        .eq('paciente_id', patientId)
        .eq('is_archived', false)
        .order('data_insercao', { ascending: false });

      if (error) {
        console.error('Erro ao buscar dispositivos:', error);
        throw error;
      }
      console.log('Dispositivos encontrados:', data);
      return (data as Dispositivo[]) || [];
    } catch (error) {
      logError(error, 'backgroundService.getDispositivos');
      return [];
    }
  },

  async saveDispositivo(dispositivo: Omit<Dispositivo, 'id' | 'created_at'>): Promise<Dispositivo | null> {
    try {
      console.log('Salvando dispositivo:', dispositivo);
      const { data, error } = await supabase
        .from('dispositivos_pacientes')
        .insert(dispositivo)
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao salvar dispositivo:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      console.log('Dispositivo salvo com sucesso:', data);
      return data as Dispositivo;
    } catch (error) {
      console.error('Exceção ao salvar dispositivo:', error);
      logError(error, 'backgroundService.saveDispositivo');
      return null;
    }
  },

  async updateDispositivo(id: number, updates: Partial<Dispositivo>): Promise<Dispositivo | null> {
    try {
      console.log('🔄 UPDATE Dispositivo ID:', id, 'Dados:', updates);
      
      const { data, error } = await supabase
        .from('dispositivos_pacientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro Supabase update:', error);
        throw error;
      }
      
      console.log('✅ Dispositivo atualizado com sucesso:', data);
      return data as Dispositivo;
    } catch (error) {
      console.error('❌ Erro ao atualizar dispositivo:', error);
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
      console.log('🔄 UPDATE Cultura ID:', id, 'Dados:', updates);
      
      const { data, error } = await supabase
        .from('culturas_pacientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro Supabase update:', error);
        throw error;
      }
      
      console.log('✅ Cultura atualizada com sucesso:', data);
      return data as Cultura;
    } catch (error) {
      console.error('❌ Erro ao atualizar cultura:', error);
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
      console.log('🔄 UPDATE Procedimento ID:', id, 'Dados:', updates);
      
      const { data, error } = await supabase
        .from('procedimentos_pacientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro Supabase update:', error);
        throw error;
      }
      
      console.log('✅ Procedimento atualizado com sucesso:', data);
      return data as Procedimento;
    } catch (error) {
      console.error('❌ Erro ao atualizar procedimento:', error);
      logError(error, 'backgroundService.updateProcedimento');
      return null;
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
      console.log('🗄️ [backgroundService.saveExame] Inserindo:', exame);
      
      const { data, error } = await supabase
        .from('exames_pacientes')
        .insert(exame)
        .select()
        .single();

      if (error) {
        console.error('❌ [backgroundService.saveExame] Erro do Supabase:', error);
        throw error;
      }
      
      console.log('✅ [backgroundService.saveExame] Sucesso:', data);
      return data as Exame;
    } catch (error) {
      console.error('❌ [backgroundService.saveExame] Erro capturado:', error);
      logError(error, 'backgroundService.saveExame');
      return null;
    }
  },

  async updateExame(id: number, updates: Partial<Exame>): Promise<Exame | null> {
    try {
      console.log('🔄 UPDATE Exame ID:', id, 'Dados:', updates);
      
      const { data, error } = await supabase
        .from('exames_pacientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro Supabase update:', error);
        throw error;
      }
      
      console.log('✅ Exame atualizado com sucesso:', data);
      return data as Exame;
    } catch (error) {
      console.error('❌ Erro ao atualizar exame:', error);
      logError(error, 'backgroundService.updateExame');
      return null;
    }
  },

  async deleteExame(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('exames_pacientes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao deletar exame:', error);
        throw error;
      }
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar exame:', error);
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
      return null;
    }
  },

  async updateDieta(id: string, updates: Partial<Dieta>): Promise<Dieta | null> {
    try {
      console.log('🔄 UPDATE Dieta ID:', id, 'Dados:', updates);
      
      const { data, error } = await supabase
        .from('dietas_pacientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro Supabase update:', error);
        throw error;
      }
      
      console.log('✅ Dieta atualizada com sucesso:', data);
      return data as Dieta;
    } catch (error) {
      console.error('❌ Erro ao atualizar dieta:', error);
      logError(error, 'backgroundService.updateDieta');
      return null;
    }
  }
};
