import { supabase } from '../lib/supabase';
import { Patient } from '../types';
import { logError } from '../utils/errorHandler';

/**
 * Serviço de Pacientes
 * Conecta com a tabela patients do Supabase
 */

export const patientsService = {
  /**
 * Listar pacientes - Simples e direto
 */
async listPatients(limit: number = 50): Promise<Patient[]> {
  try {
    console.log('📊 patientsService.listPatients: iniciando...', { limit });
    const startTime = Date.now();
    
    // Query simples e direta - Filtrar APENAS pacientes não arquivados
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .filter('archived_at', 'is', null)
      .limit(limit);
    
    const duration = Date.now() - startTime;
    
    if (error) {
      console.error('❌ Erro Supabase:', error);
      throw error;
    }
    
    // Ordenar localmente
    const result = (data || []).sort((a, b) => (a.bed_number || 0) - (b.bed_number || 0));
    console.log('✅ patientsService.listPatients: retornando', result.length, 'pacientes em', duration + 'ms');
    return result;
  } catch (error) {
    console.error('❌ patientsService.listPatients: erro:', error);
    logError(error, 'patientsService.listPatients');
    throw error;
  }
},

  /**
   * Obter um paciente por ID
   */
  async getPatient(id: string): Promise<Patient | null> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .filter('archived_at', 'is', null)
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logError(error, 'patientsService.getPatient');
      return null;
    }
  },

  /**
   * Listar pacientes arquivados
   */
  async getArchivedPatients(limit: number = 100): Promise<Patient[]> {
    try {
      console.log('📦 patientsService.getArchivedPatients: iniciando...', { limit });
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .not('archived_at', 'is', null)
        .order('archived_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      console.log('✅ patientsService.getArchivedPatients: retornando', (data || []).length, 'pacientes arquivados');
      return data || [];
    } catch (error) {
      console.error('❌ patientsService.getArchivedPatients: erro:', error);
      logError(error, 'patientsService.getArchivedPatients');
      throw error;
    }
  },

  /**
   * Arquivar paciente
   */
  async archivePatient(id: string, motivo: string): Promise<Patient | null> {
    try {
      console.log('📦 Arquivando paciente:', { id, motivo });
      
      const { data, error } = await supabase
        .from('patients')
        .update({
          archived_at: new Date().toISOString(),
          motivo_arquivamento: motivo
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Limpar cache completamente
      sessionStorage.removeItem('patientsList');
      sessionStorage.removeItem('patientsListTimestamp');
      
      console.log('✅ Paciente arquivado com sucesso');
      return data || null;
    } catch (error) {
      console.error('❌ Erro ao arquivar paciente:', error);
      logError(error, 'patientsService.archivePatient');
      return null;
    }
  },

  /**
   * Restaurar paciente arquivado
   */
  async restorePatient(id: string): Promise<Patient | null> {
    try {
      console.log('📦 Restaurando paciente:', { id });
      
      const { data, error } = await supabase
        .from('patients')
        .update({
          archived_at: null,
          motivo_arquivamento: null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Limpar cache completamente
      sessionStorage.removeItem('patientsList');
      sessionStorage.removeItem('patientsListTimestamp');
      
      console.log('✅ Paciente restaurado com sucesso');
      return data || null;
    } catch (error) {
      console.error('❌ Erro ao restaurar paciente:', error);
      logError(error, 'patientsService.restorePatient');
      return null;
    }
  },

  /**
   * Criar novo paciente
   */
  async createPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient | null> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([patient])
        .select()
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logError(error, 'patientsService.createPatient');
      return null;
    }
  },

  /**
   * Atualizar paciente
   */
  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | null> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logError(error, 'patientsService.updatePatient');
      return null;
    }
  },

  /**
   * Deletar paciente
   */
  async deletePatient(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      logError(error, 'patientsService.deletePatient');
      return false;
    }
  },

  /**
   * Buscar pacientes por nome ou leito
   * Usa a coluna nomepaciente_norm para busca case-insensitive
   */
  async searchPatients(searchTerm: string): Promise<Patient[]> {
    try {
      const normalizedTerm = searchTerm.toLowerCase();
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .filter('archived_at', 'is', null)
        .or(`nomepaciente_norm.ilike.%${normalizedTerm}%,bed_number.eq.${parseInt(searchTerm) || -1}`)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logError(error, 'patientsService.searchPatients');
      return [];
    }
  },

  /**
   * Listar pacientes por status
   */
  async getPatientsByStatus(status: 'estavel' | 'instavel' | 'em_risco'): Promise<Patient[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('status', status)
        .filter('archived_at', 'is', null)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logError(error, 'patientsService.getPatientsByStatus');
      return [];
    }
  },

  /**
   * Listar pacientes por leito
   */
  async getPatientByBedNumber(bedNumber: number): Promise<Patient | null> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('bed_number', bedNumber)
        .filter('archived_at', 'is', null)
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logError(error, 'patientsService.getPatientByBedNumber');
      return null;
    }
  },

  /**
   * Atualizar status do paciente
   */
  async updatePatientStatus(patientId: string, status: 'estavel' | 'instavel' | 'em_risco'): Promise<boolean> {
    try {
      console.log(`📝 Atualizando status do paciente ${patientId} para: ${status}`);
      const { error } = await supabase
        .from('patients')
        .update({ status })
        .eq('id', patientId);

      if (error) {
        console.error(`❌ Erro ao atualizar status:`, error);
        logError(error, 'patientsService.updatePatientStatus');
        return false;
      }

      console.log(`✅ Status atualizado com sucesso`);
      return true;
    } catch (error) {
      console.error('❌ ERRO em updatePatientStatus:', error);
      logError(error, 'patientsService.updatePatientStatus');
      return false;
    }
  },
};
