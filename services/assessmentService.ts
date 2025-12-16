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

      console.log(`[AssessmentService] Salvando ${shift}:`, updateData);

      // Primeiro, tenta buscar o registro existente
      const { data: existingData, error: selectError } = await supabase
        .from('assessment_shifts')
        .select('*')
        .eq('round_id', roundId)
        .single();

      console.log(`[AssessmentService] Registro existente:`, existingData, selectError);

      let error;
      if (existingData) {
        // Se existe, faz update
        console.log(`[AssessmentService] Atualizando registro existente`);
        const { error: updateError } = await supabase
          .from('assessment_shifts')
          .update(updateData)
          .eq('round_id', roundId);
        error = updateError;
      } else {
        // Se não existe, faz insert
        console.log(`[AssessmentService] Inserindo novo registro`);
        const { error: insertError } = await supabase
          .from('assessment_shifts')
          .insert([updateData]);
        error = insertError;
      }

      if (error) {
        console.error(`[AssessmentService] Erro ao salvar:`, error);
        logError(error, 'assessmentService.saveShiftAssessment');
        return false;
      }

      console.log(`[AssessmentService] Salvo com sucesso`);
      return true;
    } catch (error) {
      console.error(`[AssessmentService] Exception:`, error);
      logError(error, 'assessmentService.saveShiftAssessment');
      return false;
    }
  },

  /**
   * Buscar avaliação por round ID
   */
  async getAssessmentByRound(roundId: string): Promise<ClinicalRoundAssessment | null> {
    try {
      console.log(`[AssessmentService] Buscando avaliação para round:`, roundId);
      const { data: assessments, error } = await supabase
        .from('assessment_shifts')
        .select('*')
        .eq('round_id', roundId);

      console.log(`[AssessmentService] Resultado da busca:`, assessments, error);

      if (error) {
        console.error(`[AssessmentService] Erro na busca:`, error);
        logError(error, 'assessmentService.getAssessmentByRound');
        return null;
      }

      if (!assessments || assessments.length === 0) {
        console.log(`[AssessmentService] Nenhum registro encontrado`);
        return null;
      }

      const assessment = assessments[0];
      console.log(`[AssessmentService] Avaliação carregada com sucesso:`, assessment);
      return assessment as ClinicalRoundAssessment;
    } catch (error) {
      console.error(`[AssessmentService] Exception ao buscar:`, error);
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
