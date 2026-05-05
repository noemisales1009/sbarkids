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

      const updateData = {
        patient_id: patientId,
        ...(roundId && { round_id: roundId }),
        [`assessment_${shift}`]: content,
        [`assessment_${shift}_saved_by_name`]: userName,
        [`assessment_${shift}_saved_at`]: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Buscar registro ATIVO (não arquivado) mais recente
      let selectQuery = supabase
        .from('clinical_rounds_simple')
        .select('id')
        .eq('patient_id', patientId)
        .eq('is_archived', false);

      if (roundId) {
        selectQuery = selectQuery.eq('round_id', roundId);
      } else {
        selectQuery = selectQuery.is('round_id', null);
      }

      const { data: existingRows, error: selectError } = await selectQuery
        .order('updated_at', { ascending: false })
        .limit(1);

      if (selectError) {
        logError(selectError, 'clinicalRoundsSimpleService.select');
        return false;
      }

      const existingData = existingRows && existingRows.length > 0 ? existingRows[0] : null;

      let result;
      if (existingData) {
        const { error } = await supabase
          .from('clinical_rounds_simple')
          .update(updateData)
          .eq('id', existingData.id);

        result = error;
      } else {
        const { error } = await supabase
          .from('clinical_rounds_simple')
          .insert([updateData]);

        result = error;
      }

      if (result) {
        logError(result, `clinicalRoundsSimpleService.saveAssessment.${shift}`);
        return false;
      }

      // Registrar no histórico de edições (não bloqueia o save se falhar)
      try {
        const { data: authData } = await supabase.auth.getUser();
        await supabase
          .from('clinical_rounds_assessment_edits')
          .insert([{
            patient_id: patientId,
            round_id: roundId || null,
            shift,
            content,
            edited_by: authData?.user?.id || null,
            edited_by_name: userName
          }]);
      } catch (historyErr) {
        logError(historyErr, 'clinicalRoundsSimpleService.saveAssessment.history');
      }

      return true;
    } catch (error: any) {
      logError(error, 'clinicalRoundsSimpleService.saveAssessment');
      return false;
    }
  },

  /**
   * Buscar histórico de edições do Assessment
   */
  async getAssessmentEdits(
    patientId: string,
    shift: 'morning' | 'afternoon' | 'night'
  ): Promise<Array<{ id: number; content: string; nome_editor: string; data_edicao: string }>> {
    try {
      const { data, error } = await supabase
        .from('clinical_rounds_assessment_edits_com_usuario')
        .select('id, content, nome_editor, data_edicao')
        .eq('patient_id', patientId)
        .eq('shift', shift)
        .order('data_edicao', { ascending: false });

      if (error) {
        logError(error, 'clinicalRoundsSimpleService.getAssessmentEdits');
        return [];
      }
      return (data || []) as any[];
    } catch (error) {
      logError(error, 'clinicalRoundsSimpleService.getAssessmentEdits');
      return [];
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

      const updateData = {
        patient_id: patientId,
        ...(roundId && { round_id: roundId }),
        [`recommendation_${shift}`]: content,
        [`recommendation_${shift}_saved_by_name`]: userName,
        [`recommendation_${shift}_saved_at`]: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Buscar registro ATIVO (não arquivado) mais recente
      let selectQuery = supabase
        .from('clinical_rounds_simple')
        .select('id')
        .eq('patient_id', patientId)
        .eq('is_archived', false);

      if (roundId) {
        selectQuery = selectQuery.eq('round_id', roundId);
      } else {
        selectQuery = selectQuery.is('round_id', null);
      }

      const { data: existingRows, error: selectError } = await selectQuery
        .order('updated_at', { ascending: false })
        .limit(1);

      if (selectError) {
        logError(selectError, 'clinicalRoundsSimpleService.select');
        return false;
      }

      const existingData = existingRows && existingRows.length > 0 ? existingRows[0] : null;

      let result;
      if (existingData) {
        const { error } = await supabase
          .from('clinical_rounds_simple')
          .update(updateData)
          .eq('id', existingData.id);

        result = error;
      } else {
        const { error } = await supabase
          .from('clinical_rounds_simple')
          .insert([updateData]);

        result = error;
      }

      if (result) {
        logError(result, `clinicalRoundsSimpleService.saveRecommendation.${shift}`);
        return false;
      }

      return true;
    } catch (error: any) {
      logError(error, 'clinicalRoundsSimpleService.saveRecommendation');
      return false;
    }
  },

  /**
   * Carregar dados completos de um paciente/round
   */
  async getByRound(patientId: string, roundId?: string): Promise<ClinicalRoundsSimple | null> {
    try {

      let query = supabase
        .from('clinical_rounds_simple')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_archived', false); // Filtrar apenas não arquivados

      if (roundId) {
        query = query.eq('round_id', roundId);
      } else {
        query = query.is('round_id', null);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        logError(error, 'clinicalRoundsSimpleService.getByRound');
        return null;
      }

      return data as ClinicalRoundsSimple | null;
    } catch (error: any) {
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
      return { content: null, savedBy: null, savedAt: null };
    }
  },

  /**
   * Deletar dados de um turno
   */
  async deleteShift(patientId: string, roundId: string | undefined, shift: 'morning' | 'afternoon' | 'night'): Promise<boolean> {
    try {

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
        logError(error, `clinicalRoundsSimpleService.deleteShift.${shift}`);
        return false;
      }

      return true;
    } catch (error) {
      logError(error, 'clinicalRoundsSimpleService.deleteShift');
      return false;
    }
  },

  /**
   * Arquivar um registro (soft delete)
   */
  async archiveRound(
    patientId: string,
    roundId?: string
  ): Promise<boolean> {
    try {

      let query = supabase
        .from('clinical_rounds_simple')
        .update({
          is_archived: true,
          archived_at: new Date().toISOString()
        })
        .eq('patient_id', patientId);

      if (roundId) {
        query = query.eq('round_id', roundId);
      } else {
        query = query.is('round_id', null);
      }

      const { error } = await query;

      if (error) {
        logError(error, 'clinicalRoundsSimpleService.archiveRound');
        return false;
      }

      return true;
    } catch (error) {
      logError(error, 'clinicalRoundsSimpleService.archiveRound');
      return false;
    }
  },

  /**
   * Buscar registros arquivados (para histórico)
   */
  async getArchivedByRound(patientId: string, roundId?: string): Promise<ClinicalRoundsSimple | null> {
    try {

      let query = supabase
        .from('clinical_rounds_simple')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_archived', true); // Filtrar apenas arquivados

      if (roundId) {
        query = query.eq('round_id', roundId);
      } else {
        query = query.is('round_id', null);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        logError(error, 'clinicalRoundsSimpleService.getArchivedByRound');
        return null;
      }

      return data as ClinicalRoundsSimple | null;
    } catch (error) {
      logError(error, 'clinicalRoundsSimpleService.getArchivedByRound');
      return null;
    }
  },

  /**
   * Obter todos os assessments do paciente para histórico
   */
  async getAll(patientId: string): Promise<ClinicalRoundsSimple[]> {
    try {
      const { data, error } = await supabase
        .from('clinical_rounds_simple')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_archived', false)
        .order('updated_at', { ascending: false });

      if (error) {
        logError(error, 'clinicalRoundsSimpleService.getAll');
        return [];
      }

      return data || [];
    } catch (error) {
      logError(error, 'clinicalRoundsSimpleService.getAll');
      return [];
    }  }
};