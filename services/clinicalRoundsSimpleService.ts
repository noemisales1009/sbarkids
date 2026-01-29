import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

export interface ClinicalRoundsSimple {
  id: string;
  patient_id: string;
  round_id?: string;
  created_at: string;
  updated_at: string;

  // Assessment (Avaliação)
  assessment_morning: string | null;
  assessment_morning_saved_by_name: string | null;
  assessment_morning_saved_at: string | null;

  assessment_afternoon: string | null;
  assessment_afternoon_saved_by_name: string | null;
  assessment_afternoon_saved_at: string | null;

  assessment_night: string | null;
  assessment_night_saved_by_name: string | null;
  assessment_night_saved_at: string | null;

  // Recommendation (Recomendação/Plano)
  recommendation_morning: string | null;
  recommendation_morning_saved_by_name: string | null;
  recommendation_morning_saved_at: string | null;

  recommendation_afternoon: string | null;
  recommendation_afternoon_saved_by_name: string | null;
  recommendation_afternoon_saved_at: string | null;

  recommendation_night: string | null;
  recommendation_night_saved_by_name: string | null;
  recommendation_night_saved_at: string | null;
}

/**
 * Serviço para gerenciar Assessment e Recomendação simplificados
 * Um único campo de texto por turno
 */
export const clinicalRoundsSimpleService = {
  /**
   * Salvar Assessment (Avaliação) por turno
   */
  async saveAssessment(
    patientId: string,
    roundId: string | undefined,
    shift: 'morning' | 'afternoon' | 'night',
    content: string,
    userName: string
  ): Promise<boolean> {
    try {
      console.log(`📌 [ClinicalRoundsSimple] Salvando Assessment ${shift}...`);

      const updateData = {
        patient_id: patientId,
        ...(roundId && { round_id: roundId }),
        [`assessment_${shift}`]: content,
        [`assessment_${shift}_saved_by_name`]: userName,
        [`assessment_${shift}_saved_at`]: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Buscar registro existente
      const { data: existingData, error: selectError } = await supabase
        .from('clinical_rounds_simple')
        .select('id')
        .eq('patient_id', patientId)
        .eq('round_id', roundId || null)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.warn('⚠️ Erro ao buscar registro:', selectError);
      }

      let result;
      if (existingData) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('clinical_rounds_simple')
          .update(updateData)
          .eq('id', existingData.id);

        result = error;
      } else {
        // Inserir novo registro
        const { error } = await supabase
          .from('clinical_rounds_simple')
          .insert([updateData]);

        result = error;
      }

      if (result) {
        console.error(`❌ Erro ao salvar Assessment ${shift}:`, result);
        logError(result, `clinicalRoundsSimpleService.saveAssessment.${shift}`);
        return false;
      }

      console.log(`✅ Assessment ${shift} salvo com sucesso`);
      return true;
    } catch (error) {
      console.error('❌ Exception em saveAssessment:', error);
      logError(error, 'clinicalRoundsSimpleService.saveAssessment');
      return false;
    }
  },

  /**
   * Salvar Recomendação (Plano) por turno
   */
  async saveRecommendation(
    patientId: string,
    roundId: string | undefined,
    shift: 'morning' | 'afternoon' | 'night',
    content: string,
    userName: string
  ): Promise<boolean> {
    try {
      console.log(`📌 [ClinicalRoundsSimple] Salvando Recommendation ${shift}...`);

      const updateData = {
        patient_id: patientId,
        ...(roundId && { round_id: roundId }),
        [`recommendation_${shift}`]: content,
        [`recommendation_${shift}_saved_by_name`]: userName,
        [`recommendation_${shift}_saved_at`]: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Buscar registro existente
      const { data: existingData, error: selectError } = await supabase
        .from('clinical_rounds_simple')
        .select('id')
        .eq('patient_id', patientId)
        .eq('round_id', roundId || null)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.warn('⚠️ Erro ao buscar registro:', selectError);
      }

      let result;
      if (existingData) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('clinical_rounds_simple')
          .update(updateData)
          .eq('id', existingData.id);

        result = error;
      } else {
        // Inserir novo registro
        const { error } = await supabase
          .from('clinical_rounds_simple')
          .insert([updateData]);

        result = error;
      }

      if (result) {
        console.error(`❌ Erro ao salvar Recommendation ${shift}:`, result);
        logError(result, `clinicalRoundsSimpleService.saveRecommendation.${shift}`);
        return false;
      }

      console.log(`✅ Recommendation ${shift} salvo com sucesso`);
      return true;
    } catch (error) {
      console.error('❌ Exception em saveRecommendation:', error);
      logError(error, 'clinicalRoundsSimpleService.saveRecommendation');
      return false;
    }
  },

  /**
   * Carregar dados completos de um paciente/round
   */
  async getByRound(patientId: string, roundId?: string): Promise<ClinicalRoundsSimple | null> {
    try {
      console.log(`📌 [ClinicalRoundsSimple] Carregando dados para patient=${patientId}, round=${roundId}`);

      let query = supabase
        .from('clinical_rounds_simple')
        .select('*')
        .eq('patient_id', patientId);

      if (roundId) {
        query = query.eq('round_id', roundId);
      } else {
        query = query.is('round_id', null);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ Nenhum registro encontrado (esperado na primeira vez)');
          return null;
        }
        console.error('❌ Erro ao carregar dados:', error);
        logError(error, 'clinicalRoundsSimpleService.getByRound');
        return null;
      }

      console.log('✅ Dados carregados com sucesso');
      return data as ClinicalRoundsSimple;
    } catch (error) {
      console.error('❌ Exception em getByRound:', error);
      logError(error, 'clinicalRoundsSimpleService.getByRound');
      return null;
    }
  },

  /**
   * Obter apenas Assessment de um turno
   */
  async getAssessmentShift(
    patientId: string,
    roundId: string | undefined,
    shift: 'morning' | 'afternoon' | 'night'
  ): Promise<{ content: string | null; savedBy: string | null; savedAt: string | null }> {
    try {
      const data = await this.getByRound(patientId, roundId);

      if (!data) {
        return { content: null, savedBy: null, savedAt: null };
      }

      return {
        content: data[`assessment_${shift}`] as string | null,
        savedBy: data[`assessment_${shift}_saved_by_name`] as string | null,
        savedAt: data[`assessment_${shift}_saved_at`] as string | null
      };
    } catch (error) {
      console.error('❌ Exception em getAssessmentShift:', error);
      return { content: null, savedBy: null, savedAt: null };
    }
  },

  /**
   * Obter apenas Recomendação de um turno
   */
  async getRecommendationShift(
    patientId: string,
    roundId: string | undefined,
    shift: 'morning' | 'afternoon' | 'night'
  ): Promise<{ content: string | null; savedBy: string | null; savedAt: string | null }> {
    try {
      const data = await this.getByRound(patientId, roundId);

      if (!data) {
        return { content: null, savedBy: null, savedAt: null };
      }

      return {
        content: data[`recommendation_${shift}`] as string | null,
        savedBy: data[`recommendation_${shift}_saved_by_name`] as string | null,
        savedAt: data[`recommendation_${shift}_saved_at`] as string | null
      };
    } catch (error) {
      console.error('❌ Exception em getRecommendationShift:', error);
      return { content: null, savedBy: null, savedAt: null };
    }
  },

  /**
   * Deletar dados de um turno
   */
  async deleteShift(patientId: string, roundId: string | undefined, shift: 'morning' | 'afternoon' | 'night'): Promise<boolean> {
    try {
      console.log(`📌 [ClinicalRoundsSimple] Deletando dados do turno ${shift}...`);

      const updateData = {
        [`assessment_${shift}`]: null,
        [`assessment_${shift}_saved_by_name`]: null,
        [`assessment_${shift}_saved_at`]: null,
        [`recommendation_${shift}`]: null,
        [`recommendation_${shift}_saved_by_name`]: null,
        [`recommendation_${shift}_saved_at`]: null,
        updated_at: new Date().toISOString()
      };

      let query = supabase
        .from('clinical_rounds_simple')
        .update(updateData)
        .eq('patient_id', patientId);

      if (roundId) {
        query = query.eq('round_id', roundId);
      } else {
        query = query.is('round_id', null);
      }

      const { error } = await query;

      if (error) {
        console.error(`❌ Erro ao deletar turno ${shift}:`, error);
        logError(error, `clinicalRoundsSimpleService.deleteShift.${shift}`);
        return false;
      }

      console.log(`✅ Turno ${shift} deletado com sucesso`);
      return true;
    } catch (error) {
      console.error('❌ Exception em deleteShift:', error);
      logError(error, 'clinicalRoundsSimpleService.deleteShift');
      return false;
    }
  }
};
