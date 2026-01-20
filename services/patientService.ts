/**
 * Serviço para gerenciar pacientes
 */

import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

export type PatientStatus = 'estavel' | 'instavel' | 'em_risco';

export type SuporteVentilatorio = 
  | 'Cateter Nasal (O2)'
  | 'Máscara de Venturi (O2)'
  | 'Máscara Não Reinalante (O2)'
  | 'CNAF (Alto Fluxo)'
  | 'CPAP (VNI)'
  | 'BiPAP (VNI)'
  | 'Ventilação Invasiva - PCV'
  | 'Ventilação Invasiva - VCV'
  | 'Ventilação Invasiva - PSV';

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
  },

  /**
   * Atualizar suportes ventilatórios do paciente
   */
  async updateSuportesVentilatorios(patientId: string, suportes: SuporteVentilatorio[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ suporte_ventilatorio: suportes })
        .eq('id', patientId);

      if (error) {
        logError(error, 'patientService.updateSuportesVentilatorios');
        return false;
      }

      return true;
    } catch (error) {
      logError(error, 'patientService.updateSuportesVentilatorios');
      return false;
    }
  },

  /**
   * Buscar suportes ventilatórios do paciente
   */
  async getSuportesVentilatorios(patientId: string): Promise<SuporteVentilatorio[]> {
    try {
      const { data: patient, error } = await supabase
        .from('patients')
        .select('suporte_ventilatorio')
        .eq('id', patientId)
        .single();

      if (error) {
        logError(error, 'patientService.getSuportesVentilatorios');
        return [];
      }

      return (patient?.suporte_ventilatorio as SuporteVentilatorio[]) || [];
    } catch (error) {
      logError(error, 'patientService.getSuportesVentilatorios');
      return [];
    }
  }
};
