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
      
      // Debug: mostrar dados de um alerta de cada fonte
      if (taskAlertasFormatted.length > 0) {
        console.log('📌 Exemplo TASK:', {
          id: taskAlertasFormatted[0].id_alerta,
          prazo_limite_formatado: taskAlertasFormatted[0].prazo_limite_formatado,
          prazo_formatado: taskAlertasFormatted[0].prazo_formatado,
          deadline: taskAlertasFormatted[0].deadline,
          created_at: taskAlertasFormatted[0].created_at
        });
      }
      
      if (alertasPacienteFormatted.length > 0) {
        console.log('📌 Exemplo ALERTA_PACIENTE:', {
          id: alertasPacienteFormatted[0].id_alerta,
          prazo_limite_formatado: alertasPacienteFormatted[0].prazo_limite_formatado,
          prazo_formatado: alertasPacienteFormatted[0].prazo_formatado,
          deadline: alertasPacienteFormatted[0].deadline,
          created_at: alertasPacienteFormatted[0].created_at
        });
      }
      
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
  },

  /**
   * Atualiza a justificativa de um alerta
   */
  async updateJustificativa(alertaId: string, justificativa: string, fonte: 'tasks' | 'alertas_paciente'): Promise<boolean> {
    try {
      console.log(`📍 alertasService.updateJustificativa - Atualizando ${fonte}/${alertaId}`);

      const tableName = fonte === 'tasks' ? 'tasks' : 'alertas_paciente';
      
      // Verificar se é um UUID ou número
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(alertaId);
      const id = isUUID ? alertaId : parseInt(alertaId);

      // Nome da coluna varia conforme a tabela
      const columnName = fonte === 'tasks' ? 'justification' : 'justificativa';

      const { error } = await supabase
        .from(tableName)
        .update({ 
          [columnName]: justificativa,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error(`❌ Erro ao atualizar justificativa em ${tableName}:`, error);
        logError(error, `alertasService.updateJustificativa - ${tableName}`);
        return false;
      }

      console.log(`✅ Justificativa atualizada com sucesso em ${tableName}`);
      return true;
    } catch (error) {
      console.error('❌ ERRO em updateJustificativa:', error);
      logError(error, 'alertasService.updateJustificativa');
      return false;
    }
  },

  /**
   * Marca um alerta como concluído
   */
  async marcarComoConcluido(alertaId: string, fonte: 'tasks' | 'alertas_paciente'): Promise<boolean> {
    try {
      console.log(`📍 alertasService.marcarComoConcluido - Marcando ${fonte}/${alertaId} como concluído`);

      const tableName = fonte === 'tasks' ? 'tasks' : 'alertas_paciente';
      const statusColumn = tableName === 'tasks' ? 'status' : 'status';

      const { error } = await supabase
        .from(tableName)
        .update({ 
          [statusColumn]: 'concluido',
          updated_at: new Date().toISOString()
        })
        .eq('id', parseInt(alertaId));

      if (error) {
        console.error(`❌ Erro ao marcar como concluído em ${tableName}:`, error);
        logError(error, `alertasService.marcarComoConcluido - ${tableName}`);
        return false;
      }

      console.log(`✅ Alerta marcado como concluído em ${tableName}`);
      return true;
    } catch (error) {
      console.error('❌ ERRO em marcarComoConcluido:', error);
      logError(error, 'alertasService.marcarComoConcluido');
      return false;
    }
  },

  /**
   * Deleta um alerta
   */
  async deleteAlerta(alertaId: string, fonte: 'tasks' | 'alertas_paciente'): Promise<boolean> {
    try {
      console.log(`📍 alertasService.deleteAlerta - Deletando ${fonte}/${alertaId}`);

      const tableName = fonte === 'tasks' ? 'tasks' : 'alertas_paciente';

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', parseInt(alertaId));

      if (error) {
        console.error(`❌ Erro ao deletar alerta em ${tableName}:`, error);
        logError(error, `alertasService.deleteAlerta - ${tableName}`);
        return false;
      }

      console.log(`✅ Alerta deletado com sucesso de ${tableName}`);
      return true;
    } catch (error) {
      console.error('❌ ERRO em deleteAlerta:', error);
      logError(error, 'alertasService.deleteAlerta');
      return false;
    }
  }
};
