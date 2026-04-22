import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

export interface AportesPaciente {
  id: string;
  paciente_id: string;
  data_referencia: string;
  vo_ml_kg_h: number;
  hv_npt_ml_kg_h: number;
  medicacoes_ml_kg_h: number;
  tht_ml_kg_h: number | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export const aportesService = {
  async getAportes(pacienteId: string): Promise<AportesPaciente[]> {
    try {
      const { data, error } = await supabase
        .from('aportes_pacientes')
        .select('*')
        .eq('paciente_id', pacienteId)
        .is('archived_at', null)
        .order('data_referencia', { ascending: false });

      if (error) throw error;
      return (data as AportesPaciente[]) || [];
    } catch (error) {
      logError(error, 'aportesService.getAportes');
      return [];
    }
  },
};
