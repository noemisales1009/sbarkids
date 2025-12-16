/**
 * Serviço para gerenciar pacientes
 */

import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

export type PatientStatus = 'estavel' | 'instavel' | 'em_risco';

export const patientService = {
  /**
   * Atualizar status do paciente
   */
  async updatePatientStatus(patientId: string, status: PatientStatus): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ status })
        .eq('id', patientId);

      if (error) {
        logError(error, 'patientService.updatePatientStatus');
        return false;
      }

      return true;
    } catch (error) {
      logError(error, 'patientService.updatePatientStatus');
      return false;
    }
  },

  /**
   * Buscar status atual do paciente
   */
  async getPatientStatus(patientId: string): Promise<PatientStatus | null> {
    try {
      const { data: patient, error } = await supabase
        .from('patients')
        .select('status')
        .eq('id', patientId)
        .single();

      if (error) {
        logError(error, 'patientService.getPatientStatus');
        return null;
      }

      return patient?.status as PatientStatus || null;
    } catch (error) {
      logError(error, 'patientService.getPatientStatus');
      return null;
    }
  }
};
