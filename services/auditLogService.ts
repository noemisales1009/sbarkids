import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

export interface AuditLogEntry {
  id: string;
  round_id: string;
  patient_id: string;
  shift: 'morning' | 'afternoon' | 'night';
  data_type: 'assessment' | 'recommendation';
  saved_by_id: string | null;
  saved_by_name: string;
  saved_data: Record<string, unknown> | null;
  saved_at: string;
  created_at: string;
}

export const auditLogService = {
  /**
   * Registrar um salvamento no histórico de auditoria
   */
  async logSave(
    roundId: string,
    patientId: string,
    shift: 'morning' | 'afternoon' | 'night',
    dataType: 'assessment' | 'recommendation',
    savedData: Record<string, unknown>,
    savedById: string | null,
    savedByName: string
  ): Promise<AuditLogEntry | null> {
    try {
      console.log(`[auditLogService] Registrando salvamento de ${dataType}`);
      const { data: entry, error } = await supabase
        .from('round_audit_log')
        .insert([
          {
            round_id: roundId,
            patient_id: patientId,
            shift,
            data_type: dataType,
            saved_by_id: null, // Sempre null porque "user-1" não é um UUID válido
            saved_by_name: savedByName,
            saved_data: savedData,
            saved_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error(`[auditLogService] Erro ao registrar:`, error);
        logError(error, 'auditLogService.logSave');
        return null;
      }

      return entry as AuditLogEntry;
    } catch (error) {
      logError(error, 'auditLogService.logSave');
      return null;
    }
  },

  /**
   * Obter histórico de salvamentos para um round
   */
  async getAuditLog(roundId: string): Promise<AuditLogEntry[]> {
    try {
      const { data: entries, error } = await supabase
        .from('round_audit_log')
        .select('*')
        .eq('round_id', roundId)
        .order('saved_at', { ascending: false });

      if (error) {
        logError(error, 'auditLogService.getAuditLog');
        return [];
      }

      return entries as AuditLogEntry[];
    } catch (error) {
      logError(error, 'auditLogService.getAuditLog');
      return [];
    }
  },

  /**
   * Obter histórico para um turno específico
   */
  async getAuditLogByShift(roundId: string, shift: 'morning' | 'afternoon' | 'night'): Promise<AuditLogEntry[]> {
    try {
      const { data: entries, error } = await supabase
        .from('round_audit_log')
        .select('*')
        .eq('round_id', roundId)
        .eq('shift', shift)
        .order('saved_at', { ascending: false });

      if (error) {
        logError(error, 'auditLogService.getAuditLogByShift');
        return [];
      }

      return entries as AuditLogEntry[];
    } catch (error) {
      logError(error, 'auditLogService.getAuditLogByShift');
      return [];
    }
  }
};
