import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

// Log técnico de dados salvos por turno (tabela round_audit_log).
// Diferente do auditService (LGPD), este registra os dados exatos salvos em cada turno.
export interface RoundAuditEntry {
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

export const roundAuditService = {
  async logSave(
    roundId: string,
    patientId: string,
    shift: 'morning' | 'afternoon' | 'night',
    dataType: 'assessment' | 'recommendation',
    savedData: Record<string, unknown>,
    savedById: string | null,
    savedByName: string,
  ): Promise<RoundAuditEntry | null> {
    try {
      const { data: entry, error } = await supabase
        .from('round_audit_log')
        .insert([{
          round_id: roundId,
          patient_id: patientId,
          shift,
          data_type: dataType,
          saved_by_id: savedById,
          saved_by_name: savedByName,
          saved_data: savedData,
          saved_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        logError(error, 'roundAuditService.logSave');
        return null;
      }

      return entry as RoundAuditEntry;
    } catch (error) {
      logError(error, 'roundAuditService.logSave');
      return null;
    }
  },

  async getByRound(roundId: string): Promise<RoundAuditEntry[]> {
    try {
      const { data: entries, error } = await supabase
        .from('round_audit_log')
        .select('*')
        .eq('round_id', roundId)
        .order('saved_at', { ascending: false });

      if (error) {
        logError(error, 'roundAuditService.getByRound');
        return [];
      }

      return entries as RoundAuditEntry[];
    } catch (error) {
      logError(error, 'roundAuditService.getByRound');
      return [];
    }
  },

  async getByShift(
    roundId: string,
    shift: 'morning' | 'afternoon' | 'night',
  ): Promise<RoundAuditEntry[]> {
    try {
      const { data: entries, error } = await supabase
        .from('round_audit_log')
        .select('*')
        .eq('round_id', roundId)
        .eq('shift', shift)
        .order('saved_at', { ascending: false });

      if (error) {
        logError(error, 'roundAuditService.getByShift');
        return [];
      }

      return entries as RoundAuditEntry[];
    } catch (error) {
      logError(error, 'roundAuditService.getByShift');
      return [];
    }
  },
};
