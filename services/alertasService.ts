import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

export interface Alerta {
  id_alerta: string;
  patient_id: string;
  patient_name?: string;
  created_by_name: string;
  alertaclinico: string;
  responsavel: string;
  status: string;
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
  fonte?: 'tasks' | 'alertas_paciente';
}

/**
 * Serviço para gerenciar alertas do paciente
 * Busca alertas de DUAS fontes:
 * 1. tasks_view_horario_br (da tabela tasks)
 * 2. alertas_paciente_view_completa (da tabela alertas_paciente)
 */
export const alertasService = {
  /**
   * Busca todos os alertas do paciente de ambas as sources
   */
  async getAlertas(patientId: string): Promise<Alerta[]> {
    try {
      console.log(`📍 alertasService.getAlertas("${patientId}") - buscando de ambas as sources...`);
      
      // Busca de tasks_view_horario_br
      const { data: tasksAlertas, error: tasksError } = await supabase
        .from('tasks_view_horario_br')
        .select('*')
        .eq('patient_id', patientId)
        .order('ordem_prioridade', { ascending: true });

      if (tasksError) {
        console.warn('⚠️ Erro ao buscar tasks_view_horario_br:', tasksError);
      }

      // Busca de alertas_paciente_view_completa
      const { data: alertasPacienteData, error: alertasError } = await supabase
        .from('alertas_paciente_view_completa')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (alertasError) {
        console.warn('⚠️ Erro ao buscar alertas_paciente_view_completa:', alertasError);
      }

      // Combina resultados de ambas as sources
      const taskAlertasFormatted = (tasksAlertas || []).map((t: any) => ({
        ...t,
        fonte: 'tasks' as const,
        prazo_limite_formatado: t.prazo_limite_formatado || '',
        prazo_formatado: t.prazo_formatado || '',
        hora_criacao_formatado: t.hora_criacao_formatado || ''
      }));

      const alertasPacienteFormatted = (alertasPacienteData || []).map((a: any) => ({
        ...a,
        fonte: 'alertas_paciente' as const,
        id_alerta: a.id_alerta,
        alertaclinico: a.alertaclinico,
        prazo_limite_formatado: a.prazo_limite_formatado || '',
        prazo_formatado: a.prazo_formatado || '',
        hora_criacao_formatado: a.hora_criacao_formatado || ''
      }));

      const allAlertas = [...taskAlertasFormatted, ...alertasPacienteFormatted];
      
      console.log(`✅ Total de alertas encontrados: ${allAlertas.length}`);
      console.log(`   - Tasks: ${taskAlertasFormatted.length}`);
      console.log(`   - Alertas Paciente: ${alertasPacienteFormatted.length}`);
      
      return allAlertas as Alerta[];
    } catch (error) {
      console.error('❌ ERRO em getAlertas:', error);
      logError(error, 'alertasService.getAlertas');
      return [];
    }
  },

  /**
   * Busca alertas ativos (não concluídos) de um paciente
   */
  async getAtivos(patientId: string): Promise<Alerta[]> {
    try {
      console.log(`📍 alertasService.getAtivos("${patientId}") - buscando alertas ativos...`);
      
      const allAlertas = await this.getAlertas(patientId);
      const ativos = allAlertas.filter(
        a => a.status !== 'concluido' && a.status !== 'Concluído'
      );
      
      console.log(`✅ ${ativos.length} alertas ativos encontrados`);
      return ativos;
    } catch (error) {
      console.error('❌ ERRO em getAtivos:', error);
      logError(error, 'alertasService.getAtivos');
      return [];
    }
  },

  /**
   * Busca alertas fora do prazo
   */
  async getForaDoPrazo(patientId: string): Promise<Alerta[]> {
    try {
      console.log(`📍 alertasService.getForaDoPrazo("${patientId}") - buscando alertas fora do prazo...`);
      
      const allAlertas = await this.getAlertas(patientId);
      const foraDoPrazo = allAlertas.filter(a => a.live_status === 'fora_do_prazo');
      
      console.log(`✅ ${foraDoPrazo.length} alertas fora do prazo encontrados`);
      return foraDoPrazo;
    } catch (error) {
      console.error('❌ ERRO em getForaDoPrazo:', error);
      logError(error, 'alertasService.getForaDoPrazo');
      return [];
    }
  }
};
