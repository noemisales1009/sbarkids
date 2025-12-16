import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

/**
 * DEPRECATED: Use alertasService em vez disso
 * Este serviço foi consolidado com alertasService para unificar
 * todas as fontes de alertas (tasks e alertas_paciente)
 */

export interface TaskAlert {
  id_alerta: string;
  patient_id: string;
  category_id?: string;
  ordem_prioridade?: number;
  alertaclinico: string;
  responsavel: string;
  status: 'alerta' | 'concluido' | 'Concluído';
  justificativa: string | null;
  created_at: string;
  updated_at: string;
  deadline: string;
  hora_criacao_br: string;
  hora_criacao_formatado: string;
  prazo_limite_br: string;
  hora_conclusao_br: string | null;
  hora_criacao_hhmm: string;
  prazo_limite_hhmm: string;
  hora_conclusao_hhmm: string | null;
  prazo_limite_formatado: string;
  prazo_minutos_efetivo: number;
  prazo_formatado: string;
  live_status: 'concluido' | 'fora_do_prazo' | 'no_prazo';
  created_by_name: string;
}

export const tasksService = {
  /**
   * Buscar todos os alertas de um paciente da view tasks_view_horario_br
   * NOTA: Use alertasService.getAlertas() para pegar TODAS as fontes de alertas
   */
  async getAlertasByPatient(patientId: string): Promise<TaskAlert[]> {
    try {
      console.log(`📍 tasksService.getAlertasByPatient("${patientId}") - buscando na view tasks_view_horario_br...`);
      
      const { data: alertas, error } = await supabase
        .from('tasks_view_horario_br')
        .select('*')
        .eq('patient_id', patientId)
        .order('ordem_prioridade', { ascending: true });

      if (error) {
        console.error(`❌ Erro ao buscar alertas para ${patientId}:`, error);
        logError(error, 'tasksService.getAlertasByPatient');
        return [];
      }

      console.log(`✅ ${alertas?.length || 0} alertas encontrados`);
      return (alertas as TaskAlert[]) || [];
    } catch (error) {
      console.error('❌ ERRO em getAlertasByPatient:', error);
      logError(error, 'tasksService.getAlertasByPatient');
      return [];
    }
  },

  /**
   * Buscar alertas ativos (não concluídos) de um paciente
   */
  async getAtivosByPatient(patientId: string): Promise<TaskAlert[]> {
    try {
      console.log(`📍 tasksService.getAtivosByPatient("${patientId}") - buscando alertas ativos...`);
      
      const { data: alertas, error } = await supabase
        .from('tasks_view_horario_br')
        .select('*')
        .eq('patient_id', patientId)
        .neq('status', 'concluido')
        .neq('status', 'Concluído')
        .order('ordem_prioridade', { ascending: true });

      if (error) {
        console.error(`❌ Erro ao buscar alertas ativos para ${patientId}:`, error);
        logError(error, 'tasksService.getAtivosByPatient');
        return [];
      }

      console.log(`✅ ${alertas?.length || 0} alertas ativos encontrados`);
      return (alertas as TaskAlert[]) || [];
    } catch (error) {
      console.error('❌ ERRO em getAtivosByPatient:', error);
      logError(error, 'tasksService.getAtivosByPatient');
      return [];
    }
  },

  /**
   * Buscar alertas fora do prazo
   */
  async getForaDoPrazoByPatient(patientId: string): Promise<TaskAlert[]> {
    try {
      console.log(`📍 tasksService.getForaDoPrazoByPatient("${patientId}") - buscando alertas fora do prazo...`);
      
      const { data: alertas, error } = await supabase
        .from('tasks_view_horario_br')
        .select('*')
        .eq('patient_id', patientId)
        .eq('live_status', 'fora_do_prazo')
        .order('prazo_limite_br', { ascending: true });

      if (error) {
        console.error(`❌ Erro ao buscar alertas fora do prazo para ${patientId}:`, error);
        logError(error, 'tasksService.getForaDoPrazoByPatient');
        return [];
      }

      console.log(`✅ ${alertas?.length || 0} alertas fora do prazo encontrados`);
      return (alertas as TaskAlert[]) || [];
    } catch (error) {
      console.error('❌ ERRO em getForaDoPrazoByPatient:', error);
      logError(error, 'tasksService.getForaDoPrazoByPatient');
      return [];
    }
  }
};
