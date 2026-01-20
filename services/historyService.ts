import { supabase } from '../lib/supabase';
import { HistoryItemData } from '../types';
import { logError } from '../utils/errorHandler';

export interface ShiftData {
  morning: string;
  afternoon: string;
  night: string;
}

export interface HistoryRound {
  id: string;
  created_at: string;
  patient_id: string;
  status?: 'estavel' | 'instavel' | 'em_risco' | null;
  assessment: ShiftData;
  recommendation: ShiftData;
  saved_by_names: {
    morning: string | null;
    afternoon: string | null;
    night: string | null;
  };
}

/**
 * Serviço de Histórico e Relatórios
 */

export const historyService = {
  /**
   * Listar histórico de rounds de um paciente com dados de Assessment e Recommendation
   */
  async getPatientRoundsHistory(patientId: string): Promise<HistoryRound[]> {
    try {
      console.log('📚 Buscando histórico de rounds do paciente:', patientId);
      
      // 1. Buscar o status atual do paciente
      const { data: patientData } = await supabase
        .from('patients')
        .select('status')
        .eq('id', patientId)
        .single();
      
      const patientStatus = patientData?.status || 'estavel';
      
      // 2. Buscar todos os clinical_rounds do paciente
      const { data: rounds, error: roundsError } = await supabase
        .from('clinical_rounds')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (roundsError) {
        logError(roundsError, 'historyService.getPatientRoundsHistory.rounds');
        return [];
      }

      if (!rounds || rounds.length === 0) {
        console.log('📚 Nenhum round encontrado');
        return [];
      }

      console.log(`📚 ${rounds.length} rounds encontrados`);

      // 3. Para cada round, buscar os dados de assessment e recommendation
      const historyRounds: HistoryRound[] = [];

      for (const round of rounds) {
        let assessmentData = null;
        let recommendationData = null;
        try {
          const { data, error, status } = await supabase
            .from('assessment_shifts')
            .select('*')
            .eq('round_id', round.id)
            .single();
          if (!error || (error && status !== 406)) {
            assessmentData = data;
          }
        } catch (err) {
          // ignora erro 406
        }
        try {
          const { data, error, status } = await supabase
            .from('recommendation_shifts')
            .select('*')
            .eq('round_id', round.id)
            .single();
          if (!error || (error && status !== 406)) {
            recommendationData = data;
          }
        } catch (err) {
          // ignora erro 406
        }

        // Montar o objeto de histórico usando o status do paciente
        const historyRound: HistoryRound = {
          id: round.id,
          created_at: round.created_at,
          patient_id: round.patient_id,
          status: patientStatus, // Usa o status da tabela patients
          assessment: {
            morning: assessmentData?.morning_data ? 
              formatAssessmentData(assessmentData.morning_data) : '',
            afternoon: assessmentData?.afternoon_data ? 
              formatAssessmentData(assessmentData.afternoon_data) : '',
            night: assessmentData?.night_data ? 
              formatAssessmentData(assessmentData.night_data) : ''
          },
          recommendation: {
            morning: recommendationData?.morning_data ? 
              formatRecommendationData(recommendationData.morning_data) : '',
            afternoon: recommendationData?.afternoon_data ? 
              formatRecommendationData(recommendationData.afternoon_data) : '',
            night: recommendationData?.night_data ? 
              formatRecommendationData(recommendationData.night_data) : ''
          },
          saved_by_names: {
            morning: assessmentData?.morning_saved_by_name || 
                     recommendationData?.morning_saved_by_name || null,
            afternoon: assessmentData?.afternoon_saved_by_name || 
                       recommendationData?.afternoon_saved_by_name || null,
            night: assessmentData?.night_saved_by_name || 
                   recommendationData?.night_saved_by_name || null
          }
        };

        historyRounds.push(historyRound);
      }

      console.log(`📚 ${historyRounds.length} rounds processados`);
      return historyRounds;
    } catch (error) {
      logError(error, 'historyService.getPatientRoundsHistory');
      return [];
    }
  },

  /**
   * Listar histórico de um paciente (mantido para compatibilidade)
   */
  async getPatientHistory(patientId: string): Promise<HistoryItemData[]> {
    try {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('patient_id', patientId)
        .order('datetime', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logError(error, 'historyService.getPatientHistory');
      return [];
    }
  },

  /**
   * Obter relatório específico
   */
  async getReport(reportId: string): Promise<HistoryItemData | null> {
    try {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logError(error, 'historyService.getReport');
      return null;
    }
  },

  /**
   * Criar novo relatório SBAR
   */
  async createReport(report: Omit<HistoryItemData, 'id'>): Promise<HistoryItemData | null> {
    try {
      const { data, error } = await supabase
        .from('history')
        .insert([report])
        .select()
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logError(error, 'historyService.createReport');
      return null;
    }
  },

  /**
   * Atualizar relatório
   */
  async updateReport(reportId: string, updates: Partial<HistoryItemData>): Promise<HistoryItemData | null> {
    try {
      const { data, error } = await supabase
        .from('history')
        .update(updates)
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      logError(error, 'historyService.updateReport');
      return null;
    }
  },

  /**
   * Deletar relatório
   */
  async deleteReport(reportId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('history')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
      return true;
    } catch (error) {
      logError(error, 'historyService.deleteReport');
      return false;
    }
  },

  /**
   * Listar todos os relatórios (com paginação)
   */
  async getAllReports(limit: number = 50, offset: number = 0): Promise<HistoryItemData[]> {
    try {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .order('datetime', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logError(error, 'historyService.getAllReports');
      return [];
    }
  },

  /**
   * Buscar relatórios por status
   */
  async getReportsByStatus(status: string): Promise<HistoryItemData[]> {
    try {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('status', status)
        .order('datetime', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logError(error, 'historyService.getReportsByStatus');
      return [];
    }
  },
};

/**
 * Formatar dados de Assessment em texto legível
 */
function formatAssessmentData(data: any): string {
  if (!data) return '';
  
  const parts: string[] = [];
  
  if (data.respiratorio) parts.push(`🫁 Respiratório: ${data.respiratorio}`);
  if (data.hemodinamico) parts.push(`❤️ Hemodinâmico: ${data.hemodinamico}`);
  if (data.neurologico) parts.push(`🧠 Neurológico: ${data.neurologico}`);
  if (data.renal) parts.push(`💧 Renal/Hidro: ${data.renal}`);
  if (data.infeccioso) parts.push(`🦠 Infeccioso: ${data.infeccioso}`);
  if (data.observacoes) parts.push(`📝 Observações: ${data.observacoes}`);
  
  return parts.join('\n\n');
}

/**
 * Formatar dados de Recommendation em texto legível
 */
function formatRecommendationData(data: any): string {
  if (!data) return '';
  
  const parts: string[] = [];
  
  if (data.respiratorio) parts.push(`🫁 Respiratório: ${data.respiratorio}`);
  if (data.hemodinamico) parts.push(`❤️ Hemodinâmico: ${data.hemodinamico}`);
  if (data.neurologico) parts.push(`🧠 Neurológico: ${data.neurologico}`);
  if (data.metabolicoRenal) parts.push(`💧 Metabólico/Renal: ${data.metabolicoRenal}`);
  if (data.exames) parts.push(`📋 Exames: ${data.exames}`);
  if (data.pendencias) parts.push(`✅ Pendências: ${data.pendencias}`);
  
  return parts.join('\n\n');
}
