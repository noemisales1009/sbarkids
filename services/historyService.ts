import { supabase } from '../lib/supabase';
import { HistoryItemData } from '../types';
import { logError } from '../utils/errorHandler';

/**
 * Serviço de Histórico e Relatórios
 */

export const historyService = {
  /**
   * Listar histórico de um paciente
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
