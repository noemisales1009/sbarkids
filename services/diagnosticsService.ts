import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

export interface DiagnosticHistory {
  id: string;
  patient_id: string;
  pergunta_id: string;
  opcao_id: string;
  texto_digitado: string | null;
  status: string;
  created_at: string;
  opcao_label: string;
  created_by: string | null;
  created_by_name: string;
}

export interface PatientDiagnostics {
  principais: DiagnosticHistory[];
  secundarios: DiagnosticHistory[];
}

/**
 * Serviço de Diagnósticos
 * Conecta com a view diagnosticos_historico_com_usuario do Supabase
 */
export const diagnosticsService = {
  /**
   * Buscar diagnósticos de um paciente
   */
  async getPatientDiagnostics(patientId: string): Promise<PatientDiagnostics> {
    try {
      const { data, error } = await supabase
        .from('diagnosticos_historico_com_usuario')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const diagnostics = (data as DiagnosticHistory[]) || [];
      
      // DEBUG: Ver o que está vindo do Supabase

      // Separar por pergunta_id: 1 = principais, 2 = secundários
      const principais = diagnostics.filter(d => Number(d.pergunta_id) === 1);
      const secundarios = diagnostics.filter(d => Number(d.pergunta_id) === 2);
      

      return {
        principais,
        secundarios
      };
    } catch (error) {
      logError(error, 'diagnosticsService.getPatientDiagnostics');
      return {
        principais: [],
        secundarios: []
      };
    }
  },

  /**
   * Salvar diagnóstico principal
   */
  async savePrincipalDiagnostic(
    patientId: string,
    diagnostic: string,
    userId: string,
    userName: string
  ): Promise<DiagnosticHistory | null> {
    try {
      const { data, error } = await supabase
        .from('diagnosticos_historico')
        .insert({
          patient_id: patientId,
          pergunta_id: 1,
          opcao_label: diagnostic,
          status: 'principal',
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data as DiagnosticHistory;
    } catch (error) {
      logError(error, 'diagnosticsService.savePrincipalDiagnostic');
      throw error;
    }
  },

  /**
   * Adicionar diagnóstico secundário
   */
  async addSecondaryDiagnostic(
    patientId: string,
    diagnostic: string,
    userId: string,
    userName: string
  ): Promise<DiagnosticHistory | null> {
    try {
      const { data, error } = await supabase
        .from('diagnosticos_historico')
        .insert({
          patient_id: patientId,
          pergunta_id: 2,
          opcao_label: diagnostic,
          status: 'secundario',
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data as DiagnosticHistory;
    } catch (error) {
      logError(error, 'diagnosticsService.addSecondaryDiagnostic');
      throw error;
    }
  }
};
