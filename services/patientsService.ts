import { supabase } from '../lib/supabase';
import { Patient } from '../types';
import { logError } from '../utils/errorHandler';

/**
 * Serviço de Pacientes
 * Conecta com a tabela patients do Supabase
 */

export const patientsService = {
  /**
 * Listar pacientes com limite - MINIMALISTA para debug
 */
async listPatients(limit: number = 50): Promise<Patient[]> {
  try {
    console.log('📊 patientsService.listPatients: iniciando...', { limit });
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('patients')
      .select('id,name,bed_number,status,diagnosis,mother_name,dob,comorbidade,dt_internacao,peso,destino,created_at,updated_at')
      .limit(limit);
    
    const duration = Date.now() - startTime;
    console.log('📊 patientsService.listPatients: query sem order completada em', duration + 'ms');
    
    if (error) {
      console.error('❌ Erro Supabase:', error);
      throw error;
    }
    
    // Ordenar localmente em vez de na DB
    const result = (data || []).sort((a, b) => (a.bed_number || 0) - (b.bed_number || 0));
    console.log('✅ patientsService.listPatients: retornando', result.length, 'pacientes em', duration + 'ms');
    return result;
  } catch (error) {
    console.error('❌ patientsService.listPatients: exceção capturada:', error);
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
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logError(error, 'patientsService.getPatient');
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
