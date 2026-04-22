import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

export interface ScaleScore {
  id: number;
  created_at: string;
  patient_id: string;
  scale_name: string;
  score: number;
  interpretation: string;
  date: string;
  archived_at: string | null;
  motivo_arquivamento: string | null;
}

export const scalesService = {
  async getScaleScores(patientId: string): Promise<ScaleScore[]> {
    try {
      const { data, error } = await supabase
        .from('scale_scores')
        .select('*')
        .eq('patient_id', patientId)
        .is('archived_at', null)
        .order('date', { ascending: false });

      if (error) throw error;
      return (data as ScaleScore[]) || [];
    } catch (error) {
      logError(error, 'scalesService.getScaleScores');
      return [];
    }
  },
};
