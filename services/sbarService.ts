import { supabase } from '../lib/supabase';
import { HistoryItemData } from '../types';
import { logError } from '../utils/errorHandler';

/**
 * Serviço de Relatórios SBAR
 * Conecta com a tabela sbar_reports do Supabase
 */

export const sbarService = {
  /**
   * Listar relatórios de um paciente
   */
  async getPatientReports(patientId: string): Promise<HistoryItemData[]> {
    try {
      const { data, error } = await supabase
        .from('sbar_reports')
        .select('*')
        .eq('patient_id', patientId)
        .order('datetime', { ascending: false });

      if (error) throw error;

      // Mapear campos do banco para a interface
      return (data || []).map((report: any) => ({
        id: report.id,
        patient_id: report.patient_id,
        datetime: report.datetime,
        status: report.status,
        description: report.description || '',
        author: report.author,
        sbar: {
          situation: {
            diagnosis_principal: report.diagnosis_principal || '',
            diagnosis_secundarios: report.diagnosis_secundarios || [],
            status_atual: report.status_atual || 'estavel',
            suportes_vigentes: report.suportes_vigentes || [],
            drogas_vasoativas: report.drogas_vasoativas || '',
            sedoanalgesia: report.sedoanalgesia || '',
          },
          background: report.background || '',
          assessment: {
            morning: report.assessment_morning || '',
            afternoon: report.assessment_afternoon || '',
            night: report.assessment_night || '',
          },
          recommendation: {
            morning: report.recommendation_morning || '',
            afternoon: report.recommendation_afternoon || '',
            night: report.recommendation_night || '',
          },
        },
      }));
    } catch (error) {
      logError(error, 'sbarService.getPatientReports');
      return [];
    }
  },

  /**
   * Obter um relatório específico
   */
  async getReport(reportId: string): Promise<HistoryItemData | null> {
    try {
      const { data, error } = await supabase
        .from('sbar_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw error;

      if (!data) return null;

      // Mapear campos
      return {
        id: data.id,
        patient_id: data.patient_id,
        datetime: data.datetime,
        status: data.status,
        description: data.description || '',
        author: data.author,
        sbar: {
          situation: {
            diagnosis_principal: data.diagnosis_principal || '',
            diagnosis_secundarios: data.diagnosis_secundarios || [],
            status_atual: data.status_atual || 'estavel',
            suportes_vigentes: data.suportes_vigentes || [],
            drogas_vasoativas: data.drogas_vasoativas || '',
            sedoanalgesia: data.sedoanalgesia || '',
          },
          background: data.background || '',
          assessment: {
            morning: data.assessment_morning || '',
            afternoon: data.assessment_afternoon || '',
            night: data.assessment_night || '',
          },
          recommendation: {
            morning: data.recommendation_morning || '',
            afternoon: data.recommendation_afternoon || '',
            night: data.recommendation_night || '',
          },
        },
      };
    } catch (error) {
      logError(error, 'sbarService.getReport');
      return null;
    }
  },

  /**
   * Criar novo relatório SBAR
   */
  async createReport(report: Omit<HistoryItemData, 'id' | 'created_at' | 'updated_at'>): Promise<HistoryItemData | null> {
    try {
      const payload = {
        patient_id: report.patient_id,
        datetime: report.datetime,
        status: report.status,
        description: report.description,
        author: report.author,
        // Situação (S)
        diagnosis_principal: report.sbar.situation.diagnosis_principal,
        diagnosis_secundarios: report.sbar.situation.diagnosis_secundarios,
        status_atual: report.sbar.situation.status_atual,
        suportes_vigentes: report.sbar.situation.suportes_vigentes,
        drogas_vasoativas: report.sbar.situation.drogas_vasoativas,
        sedoanalgesia: report.sbar.situation.sedoanalgesia,
        // Background (B)
        background: report.sbar.background,
        // Assessment (A)
        assessment_morning: report.sbar.assessment.morning,
        assessment_afternoon: report.sbar.assessment.afternoon,
        assessment_night: report.sbar.assessment.night,
        // Recommendation (R)
        recommendation_morning: report.sbar.recommendation.morning,
        recommendation_afternoon: report.sbar.recommendation.afternoon,
        recommendation_night: report.sbar.recommendation.night,
      };

      const { data, error } = await supabase
        .from('sbar_reports')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      // Mapear resposta
      return {
        id: data.id,
        patient_id: data.patient_id,
        datetime: data.datetime,
        status: data.status,
        description: data.description,
        author: data.author,
        sbar: {
          situation: {
            diagnosis_principal: data.diagnosis_principal,
            diagnosis_secundarios: data.diagnosis_secundarios,
            status_atual: data.status_atual,
            suportes_vigentes: data.suportes_vigentes,
            drogas_vasoativas: data.drogas_vasoativas,
            sedoanalgesia: data.sedoanalgesia,
          },
          background: data.background,
          assessment: {
            morning: data.assessment_morning,
            afternoon: data.assessment_afternoon,
            night: data.assessment_night,
          },
          recommendation: {
            morning: data.recommendation_morning,
            afternoon: data.recommendation_afternoon,
            night: data.recommendation_night,
          },
        },
      };
    } catch (error) {
      logError(error, 'sbarService.createReport');
      throw error;
    }
  },

  /**
   * Atualizar relatório
   */
  async updateReport(reportId: string, report: Partial<HistoryItemData>): Promise<HistoryItemData | null> {
    try {
      const payload: any = {};

      if (report.status) payload.status = report.status;
      if (report.description) payload.description = report.description;
      if (report.sbar?.situation) {
        payload.diagnosis_principal = report.sbar.situation.diagnosis_principal;
        payload.diagnosis_secundarios = report.sbar.situation.diagnosis_secundarios;
        payload.status_atual = report.sbar.situation.status_atual;
        payload.suportes_vigentes = report.sbar.situation.suportes_vigentes;
        payload.drogas_vasoativas = report.sbar.situation.drogas_vasoativas;
        payload.sedoanalgesia = report.sbar.situation.sedoanalgesia;
      }
      if (report.sbar?.background) payload.background = report.sbar.background;
      if (report.sbar?.assessment) {
        payload.assessment_morning = report.sbar.assessment.morning;
        payload.assessment_afternoon = report.sbar.assessment.afternoon;
        payload.assessment_night = report.sbar.assessment.night;
      }
      if (report.sbar?.recommendation) {
        payload.recommendation_morning = report.sbar.recommendation.morning;
        payload.recommendation_afternoon = report.sbar.recommendation.afternoon;
        payload.recommendation_night = report.sbar.recommendation.night;
      }

      const { data, error } = await supabase
        .from('sbar_reports')
        .update(payload)
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;

      if (!data) return null;

      // Mapear resposta
      return {
        id: data.id,
        patient_id: data.patient_id,
        datetime: data.datetime,
        status: data.status,
        description: data.description,
        author: data.author,
        sbar: {
          situation: {
            diagnosis_principal: data.diagnosis_principal,
            diagnosis_secundarios: data.diagnosis_secundarios,
            status_atual: data.status_atual,
            suportes_vigentes: data.suportes_vigentes,
            drogas_vasoativas: data.drogas_vasoativas,
            sedoanalgesia: data.sedoanalgesia,
          },
          background: data.background,
          assessment: {
            morning: data.assessment_morning,
            afternoon: data.assessment_afternoon,
            night: data.assessment_night,
          },
          recommendation: {
            morning: data.recommendation_morning,
            afternoon: data.recommendation_afternoon,
            night: data.recommendation_night,
          },
        },
      };
    } catch (error) {
      logError(error, 'sbarService.updateReport');
      throw error;
    }
  },

  /**
   * Deletar relatório
   */
  async deleteReport(reportId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sbar_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
      return true;
    } catch (error) {
      logError(error, 'sbarService.deleteReport');
      return false;
    }
  },

  /**
   * Listar todos os relatórios (com paginação)
   */
  async getAllReports(limit: number = 50, offset: number = 0): Promise<HistoryItemData[]> {
    try {
      const { data, error } = await supabase
        .from('sbar_reports')
        .select('*')
        .order('datetime', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return (data || []).map((report: any) => ({
        id: report.id,
        patient_id: report.patient_id,
        datetime: report.datetime,
        status: report.status,
        description: report.description || '',
        author: report.author,
        sbar: {
          situation: {
            diagnosis_principal: report.diagnosis_principal || '',
            diagnosis_secundarios: report.diagnosis_secundarios || [],
            status_atual: report.status_atual || 'estavel',
            suportes_vigentes: report.suportes_vigentes || [],
            drogas_vasoativas: report.drogas_vasoativas || '',
            sedoanalgesia: report.sedoanalgesia || '',
          },
          background: report.background || '',
          assessment: {
            morning: report.assessment_morning || '',
            afternoon: report.assessment_afternoon || '',
            night: report.assessment_night || '',
          },
          recommendation: {
            morning: report.recommendation_morning || '',
            afternoon: report.recommendation_afternoon || '',
            night: report.recommendation_night || '',
          },
        },
      }));
    } catch (error) {
      logError(error, 'sbarService.getAllReports');
      return [];
    }
  },

  /**
   * Listar relatórios por status
   */
  async getReportsByStatus(status: string): Promise<HistoryItemData[]> {
    try {
      const { data, error } = await supabase
        .from('sbar_reports')
        .select('*')
        .eq('status', status)
        .order('datetime', { ascending: false });

      if (error) throw error;

      return (data || []).map((report: any) => ({
        id: report.id,
        patient_id: report.patient_id,
        datetime: report.datetime,
        status: report.status,
        description: report.description || '',
        author: report.author,
        sbar: {
          situation: {
            diagnosis_principal: report.diagnosis_principal || '',
            diagnosis_secundarios: report.diagnosis_secundarios || [],
            status_atual: report.status_atual || 'estavel',
            suportes_vigentes: report.suportes_vigentes || [],
            drogas_vasoativas: report.drogas_vasoativas || '',
            sedoanalgesia: report.sedoanalgesia || '',
          },
          background: report.background || '',
          assessment: {
            morning: report.assessment_morning || '',
            afternoon: report.assessment_afternoon || '',
            night: report.assessment_night || '',
          },
          recommendation: {
            morning: report.recommendation_morning || '',
            afternoon: report.recommendation_afternoon || '',
            night: report.recommendation_night || '',
          },
        },
      }));
    } catch (error) {
      logError(error, 'sbarService.getReportsByStatus');
      return [];
    }
  },
};
