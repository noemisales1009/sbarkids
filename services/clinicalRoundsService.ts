import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

export interface ClinicalRound {
  id: string;
  created_at: string;
  patient_id: string;
  created_by?: string | null;
  status?: 'estavel' | 'instavel' | 'em_risco' | null;

  // S - Situação
  s_diagnosis_current: string | null;
  s_clinical_status: string | null;
  s_supports_active: Record<string, boolean> | null;

  // B - Background
  b_medications_snapshot: unknown[] | null;
  b_devices_snapshot: unknown[] | null;
  b_cultures_snapshot: unknown[] | null;
  b_procedures_snapshot: unknown[] | null;
  b_days_hospitalized: number | null;
  b_weaning_history: string | null;

  // A - Assessment
  a_resp_work: string | null;
  a_resp_parameters: Record<string, unknown> | null;
  a_resp_gasometry: string | null;

  a_hemo_vitals: Record<string, unknown> | null;
  a_hemo_perfusion: string | null;

  a_neuro_sedation_goals: string | null;
  a_neuro_scales: Record<string, unknown> | null;

  a_renal_diuresis: number | null;
  a_renal_fluid_balance: number | null;
  a_renal_goals: string | null;

  a_risks_checklist: Record<string, boolean> | null;
  a_others_observation: string | null;

  // R - Recomendação
  r_plan_respiratory: string | null;
  r_plan_hemo: string | null;
  r_plan_neuro: string | null;
  r_plan_renal_nutri: string | null;

  r_generated_alerts: unknown[] | null;
  r_exams_evaluations_requests: Record<string, unknown> | null;
  r_pending_issues: string | null;
}

export interface ClinicalRoundInput {
  patient_id: string;
  created_by?: string | null;
  status?: 'estavel' | 'instavel' | 'em_risco' | null;

  // S - Situação
  s_diagnosis_current?: string;
  s_clinical_status?: string;
  s_supports_active?: Record<string, boolean>;

  // B - Background
  b_medications_snapshot?: unknown[];
  b_devices_snapshot?: unknown[];
  b_cultures_snapshot?: unknown[];
  b_procedures_snapshot?: unknown[];
  b_days_hospitalized?: number;
  b_weaning_history?: string;

  // A - Assessment
  a_resp_work?: string;
  a_resp_parameters?: Record<string, unknown>;
  a_resp_gasometry?: string;

  a_hemo_vitals?: Record<string, unknown>;
  a_hemo_perfusion?: string;

  a_neuro_sedation_goals?: string;
  a_neuro_scales?: Record<string, unknown>;

  a_renal_diuresis?: number;
  a_renal_fluid_balance?: number;
  a_renal_goals?: string;

  a_risks_checklist?: Record<string, boolean>;
  a_others_observation?: string;

  // R - Recomendação
  r_plan_respiratory?: string;
  r_plan_hemo?: string;
  r_plan_neuro?: string;
  r_plan_renal_nutri?: string;

  r_generated_alerts?: unknown[];
  r_exams_evaluations_requests?: Record<string, unknown>;
  r_pending_issues?: string;
}

/**
 * Serviço para gerenciar Clinical Rounds (SBAR completo)
 * Salva o relatório SBAR completo na tabela clinical_rounds
 */
export const clinicalRoundsService = {
  /**
   * Criar um novo clinical round (salvar SBAR completo)
   */
  async createRound(data: ClinicalRoundInput): Promise<ClinicalRound | null> {
    try {
      const { data: round, error } = await supabase
        .from('clinical_rounds')
        .insert([data])
        .select()
        .single();

      if (error) {
        logError(error, 'clinicalRoundsService.createRound');
        return null;
      }

      return round as ClinicalRound;
    } catch (error) {
      logError(error, 'clinicalRoundsService.createRound');
      return null;
    }
  },

  /**
   * Atualizar um clinical round existente
   */
  async updateRound(roundId: string, data: Partial<ClinicalRoundInput>): Promise<ClinicalRound | null> {
    try {
      const { data: round, error } = await supabase
        .from('clinical_rounds')
        .update(data)
        .eq('id', roundId)
        .select()
        .single();

      if (error) {
        logError(error, 'clinicalRoundsService.updateRound');
        return null;
      }

      return round as ClinicalRound;
    } catch (error) {
      logError(error, 'clinicalRoundsService.updateRound');
      return null;
    }
  },

  /**
   * Buscar um clinical round por ID
   */
  async getRoundById(roundId: string): Promise<ClinicalRound | null> {
    try {
      const { data: round, error } = await supabase
        .from('clinical_rounds')
        .select('*')
        .eq('id', roundId)
        .single();

      if (error) {
        logError(error, 'clinicalRoundsService.getRoundById');
        return null;
      }

      return round as ClinicalRound;
    } catch (error) {
      logError(error, 'clinicalRoundsService.getRoundById');
      return null;
    }
  },

  /**
   * Listar todos os clinical rounds de um paciente
   */
  async getRoundsByPatient(patientId: string): Promise<ClinicalRound[]> {
    try {
      const { data: rounds, error } = await supabase
        .from('clinical_rounds')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        logError(error, 'clinicalRoundsService.getRoundsByPatient');
        return [];
      }

      return (rounds || []) as ClinicalRound[];
    } catch (error) {
      logError(error, 'clinicalRoundsService.getRoundsByPatient');
      return [];
    }
  },

  /**
   * Obter o último round de um paciente
   */
  async getLatestRound(patientId: string): Promise<ClinicalRound | null> {
    try {
      const { data: round, error } = await supabase
        .from('clinical_rounds')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        logError(error, 'clinicalRoundsService.getLatestRound');
        return null;
      }

      return round as ClinicalRound;
    } catch (error) {
      logError(error, 'clinicalRoundsService.getLatestRound');
      return null;
    }
  },

  /**
   * Deletar um clinical round
   */
  async deleteRound(roundId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clinical_rounds')
        .delete()
        .eq('id', roundId);

      if (error) {
        logError(error, 'clinicalRoundsService.deleteRound');
        return false;
      }

      return true;
    } catch (error) {
      logError(error, 'clinicalRoundsService.deleteRound');
      return false;
    }
  }
};
