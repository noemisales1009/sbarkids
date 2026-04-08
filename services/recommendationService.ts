import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

export interface RecommendationShiftStatus {
  shift: 'morning' | 'afternoon' | 'night';
  saved_by_id: string;
  saved_by_name: string;
  saved_at: string;
}

export interface RecommendationShiftData {
  respiratorio: string;
  hemodinamico: string;
  neurologico: string;
  deliriumPrevencao: string;
  metabolicoRenal: string;
  exames: string;
}

export interface ClinicalRoundRecommendation {
  id: string;
  created_at: string;
  patient_id: string;
  round_id: string; // referência ao clinical_rounds
  
  morning_data: RecommendationShiftData;
  morning_saved_by: string | null;
  morning_saved_by_name: string | null;
  morning_saved_at: string | null;
  
  afternoon_data: RecommendationShiftData;
  afternoon_saved_by: string | null;
  afternoon_saved_by_name: string | null;
  afternoon_saved_at: string | null;
  
  night_data: RecommendationShiftData;
  night_saved_by: string | null;
  night_saved_by_name: string | null;
  night_saved_at: string | null;
}

/**
 * Serviço para gerenciar Recommendations por turno
 * Rastreia quem salvou cada turno e permite edição apenas pelo responsável
 */
export const recommendationService = {
  /**
   * Criar ou atualizar recomendação (por turno)
   */
  async saveShiftRecommendation(
    patientId: string,
    roundId: string,
    shift: 'morning' | 'afternoon' | 'night',
    data: RecommendationShiftData,
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
        .from('recommendation_shifts')
        .select('*')
        .eq('round_id', roundId)
        .single();


      let error;
      if (existingData) {
        // Se existe, faz update
        const { error: updateError } = await supabase
          .from('recommendation_shifts')
          .update(updateData)
          .eq('round_id', roundId);
        error = updateError;
      } else {
        // Se não existe, faz insert
        const { error: insertError } = await supabase
          .from('recommendation_shifts')
          .insert([updateData]);
        error = insertError;
      }

      if (error) {
        logError(error, 'recommendationService.saveShiftRecommendation');
        return false;
      }

      return true;
    } catch (error) {
      logError(error, 'recommendationService.saveShiftRecommendation');
      return false;
    }
  },

  /**
   * Buscar recomendação por round ID
   */
  async getRecommendationByRound(roundId: string): Promise<ClinicalRoundRecommendation | null> {
    try {
      const { data: recommendations, error } = await supabase
        .from('recommendation_shifts')
        .select('*')
        .eq('round_id', roundId);


      if (error) {
        logError(error, 'recommendationService.getRecommendationByRound');
        return null;
      }

      if (!recommendations || recommendations.length === 0) {
        return null;
      }

      const rec = recommendations[0];
      return rec as ClinicalRoundRecommendation;
    } catch (error) {
      logError(error, 'recommendationService.getRecommendationByRound');
      return null;
    }
  },

  /**
   * Verifica se um turno pode ser editado por um usuário
   */
  canEditShift(
    shiftData: ClinicalRoundRecommendation | null,
    shift: 'morning' | 'afternoon' | 'night',
    currentUserId: string
  ): boolean {
    if (!shiftData) return true; // Se não existe, pode criar
    
    const savedById = shiftData[`${shift}_saved_by`];
    if (!savedById) return true; // Se não foi salvo, pode editar
    
    return savedById === currentUserId; // Só o criador pode editar
  },

  /**
   * Obter informações de quem salvou um turno
   */
  getShiftSavedInfo(
    shiftData: ClinicalRoundRecommendation | null,
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
