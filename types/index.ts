/**
 * Tipos e interfaces centralizadas da aplicação
 */

// ============================================================================
// PACIENTES
// ============================================================================

export type PatientStatus = 'estavel' | 'instavel' | 'em_risco';

export interface Patient {
  id: string;
  name: string;
  bed_number: number;
  mother_name: string | null;
  dob: string; // formato: YYYY-MM-DD
  diagnosis: string | null;
  status: PatientStatus;
  comorbidade: string | null;
  dt_internacao: string | null; // formato: YYYY-MM-DD
  peso: number | null;
  destino: string | null;
  archived_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// SBAR - SITUAÇÃO ATUAL
// ============================================================================

export type SupportType = 'VM' | 'VNI' | 'O2';

export interface SbarSituation {
  diagnosis_principal: string;
  diagnosis_secundarios: string[];
  status_atual: PatientStatus;
  suportes_vigentes: SupportType[];
  drogas_vasoativas: string;
  sedoanalgesia: string;
}

export interface SbarAssessment {
  morning: string;
  afternoon: string;
  night: string;
}

export interface SbarRecommendation {
  morning: string;
  afternoon: string;
  night: string;
}

export interface SbarData {
  situation: SbarSituation;
  background: string;
  assessment: SbarAssessment;
  recommendation: SbarRecommendation;
}

// ============================================================================
// HISTÓRICO E RELATÓRIOS
// ============================================================================

export type HistoryStatus = 'Urgente' | 'Atenção' | 'Normal' | 'Informativo';

export interface HistoryItemData {
  id?: string;
  patient_id: string;
  datetime: string;
  status: HistoryStatus;
  description: string;
  author: string;
  patientName?: string;
  sbar: SbarData;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// NAVEGAÇÃO
// ============================================================================

export type CurrentPage =
    | 'login'
    | 'patients'
    | 'sbar'
    | 'history'
    | 'settings'
    | 'reports'
    | 'reportDetail'
    | 'ponto'
    | 'test';
