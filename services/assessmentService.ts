import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

export interface AssessmentShiftData {
  respiratorio: string;
  hemodinamico: string;
  neurologico: string;
  renal: string;
  infeccioso: string;
  observacoes: string;
}

export interface ClinicalRoundAssessment {
  id: string;
  created_at: string;
  patient_id: string;
  round_id: string;
  
  morning_data: AssessmentShiftData;
  morning_saved_by: string | null;
  morning_saved_by_name: string | null;
  morning_saved_at: string | null;
  
  afternoon_data: AssessmentShiftData;
  afternoon_saved_by: string | null;
  afternoon_saved_by_name: string | null;
  afternoon_saved_at: string | null;
  
  night_data: AssessmentShiftData;
  night_saved_by: string | null;
  night_saved_by_name: string | null;
  night_saved_at: string | null;
}

/**
 * Serviço para gerenciar Assessment (Avaliação) por turno
 * Rastreia quem salvou cada turno e permite edição apenas pelo responsável
 */
export const assessmentService = {
  /**
   * Salvar avaliação por turno
   */
  async saveShiftAssessment(
    patientId: string,
    roundId: string,
    shift: 'morning' | 'afternoon' | 'night',
    data: AssessmentShiftData,
    userId: string,
    userName: string
  ): Promise<boolean> {
    try {
      const shiftPrefix = shift;
      const updateData = {
        patient_id: patientId,
        round_id: roundId,
        [`${shiftPrefix}_data`]: data,
        [`${shiftPrefix}_saved_by`]: null,
        [`${shiftPrefix}_saved_by_name`]: userName,
        [`${shiftPrefix}_saved_at`]: new Date().toISOString()
      };


      // Primeiro, tenta buscar o registro existente
      const { data: existingData, error: selectError } = await supabase
        .from('assessment_shifts')
        .select('*')
        .eq('round_id', roundId)
        .single();


      let error;
      if (existingData) {
        // Se existe, faz update
        const { error: updateError } = await supabase
          .from('assessment_shifts')
          .update(updateData)
          .eq('round_id', roundId);
        error = updateError;
      } else {
        // Se não existe, faz insert
        const { error: insertError } = await supabase
          .from('assessment_shifts')
          .insert([updateData]);
        error = insertError;
      }

      if (error) {
        logError(error, 'assessmentService.saveShiftAssessment');
        return false;
      }

      return true;
    } catch (error) {
      logError(error, 'assessmentService.saveShiftAssessment');
      return false;
    }
  },

  /**
   * Buscar avaliação por round ID
   */
  async getAssessmentByRound(roundId: string): Promise<ClinicalRoundAssessment | null> {
    try {
      const { data: assessments, error } = await supabase
        .from('assessment_shifts')
        .select('*')
        .eq('round_id', roundId);


      if (error) {
        logError(error, 'assessmentService.getAssessmentByRound');
        return null;
      }

      if (!assessments || assessments.length === 0) {
        return null;
      }

      const assessment = assessments[0];
      return assessment as ClinicalRoundAssessment;
    } catch (error) {
      logError(error, 'assessmentService.getAssessmentByRound');
      return null;
    }
  },

  /**
   * Verifica se um turno pode ser editado por um usuário
   */
  canEditShift(
    shiftData: ClinicalRoundAssessment | null,
    shift: 'morning' | 'afternoon' | 'night',
    currentUserId: string
  ): boolean {
    if (!shiftData) return true;
    
    const savedById = shiftData[`${shift}_saved_by`];
    if (!savedById) return true;
    
    return savedById === currentUserId;
  },

  /**
   * Obter informações de quem salvou um turno
   */
  getShiftSavedInfo(
    shiftData: ClinicalRoundAssessment | null,
    shift: 'morning' | 'afternoon' | 'night'
  ): { savedBy: string | null; savedAt: string | null } {
    if (!shiftData) {
      return { savedBy: null, savedAt: null };
    }

    return {
      savedBy: shiftData[`${shift}_saved_by_name`],
      savedAt: shiftData[`${shift}_saved_at`]
    };
  }
};
