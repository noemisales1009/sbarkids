import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

export interface Alerta {
  id_alerta: string;
  patient_id: string;
  patient_name?: string;
  created_by_name: string;
  concluded_by_name?: string;  // Nome do usuário que concluiu
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
  live_status: 'concluido' | 'fora_do_prazo' | 'no_prazo' | 'resolvido / arquivado';
  archived_at?: string | null;  // Quando foi arquivado
  concluded_at?: string | null; // Quando foi concluído
  conclude_info?: string;       // Info da conclusão (ex: "23h 54min visível")
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
   * Busca todos os alertas do paciente de ambas as sources (excluindo arquivados)
   */
  async getAlertas(patientId: string): Promise<Alerta[]> {
    try {
      
      // Busca de tasks_view_horario_br (apenas NÃO arquivados)
      const { data: tasksAlertas, error: tasksError } = await supabase
        .from('tasks_view_horario_br')
        .select('*')
        .eq('patient_id', patientId)
        .is('archived_at', null)  // Excluir alertas arquivados
        .order('created_at', { ascending: false });

      if (tasksError) {
      }

      // Busca de alertas_paciente_view_completa (apenas NÃO arquivados)
      const { data: alertasPacienteData, error: alertasError } = await supabase
        .from('alertas_paciente_view_completa')
        .select('*')
        .eq('patient_id', patientId)
        .is('archived_at', null)  // Excluir alertas arquivados
        .order('created_at', { ascending: false });

      if (alertasError) {
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
      
      return allAlertas as Alerta[];
    } catch (error) {
      logError(error, 'alertasService.getAlertas');
      return [];
    }
  },

  /**
   * Verifica se um alerta deve ser visível
   * - Alertas NÃO concluídos: sempre visíveis
   * - Alertas concluídos: visíveis por 24h após conclusão
   * - Alertas arquivados: nunca visíveis (filtrados pelo getAlertas)
   */
  isAlertaVisible(alerta: Alerta | any): boolean {
    // Se foi arquivado, não deveria ter chegado aqui, mas como proteção extra:
    if (alerta.archived_at) {
      return false;
    }

    // Se ainda não foi concluído, está visível
    if (alerta.status !== 'concluido' && alerta.status !== 'Concluído') {
      return true;
    }

    // Alertas concluídos: verificar se ainda estão dentro da janela de 24h
    const conclusaoTimestamp = alerta.concluded_at || alerta.hora_conclusao_br;
    if (!conclusaoTimestamp) {
      return true; // Dar benefício da dúvida
    }

    const horaConclusao = new Date(conclusaoTimestamp);
    const agora = new Date();
    const tempoDecorridoMs = agora.getTime() - horaConclusao.getTime();
    const tempoDecorridoHoras = tempoDecorridoMs / (1000 * 60 * 60);

    return tempoDecorridoHoras < 24;
  },

  /**
   * Calcula tempo restante de visibilidade para um alerta concluído
   */
  getTempoRestanteVisibilidade(alerta: Alerta): string | null {
    // Se ainda não foi concluído
    if (
      alerta.status !== 'concluido' && 
      alerta.status !== 'Concluído' && 
      alerta.live_status !== 'resolvido / arquivado' &&
      alerta.live_status !== 'concluido'
    ) {
      return null;
    }

    // Se não temos hora de conclusão, tentar usar concluded_at ou updated_at
    let horaConclusao: Date | null = null;
    
    if (alerta.concluded_at) {
      horaConclusao = new Date(alerta.concluded_at);
    } else if (alerta.updated_at) {
      horaConclusao = new Date(alerta.updated_at);
    } else {
      return null;
    }

    // Usar now() em UTC
    const agoraUTC = new Date();
    
    const tempoDecorridoMs = agoraUTC.getTime() - horaConclusao.getTime();
    const tempoDecorridoHoras = tempoDecorridoMs / (1000 * 60 * 60);

    // Se passou 24 horas
    if (tempoDecorridoHoras >= 24) {
      return 'Expirado';
    }

    // Se tempo decorrido for negativo (relógio do cliente errado)
    if (tempoDecorridoHoras < 0) {
      return 'Calculando...';
    }

    // Calcular horas e minutos restantes (com decimais)
    const horasRestantes = Math.floor(24 - tempoDecorridoHoras);
    const minutosRestantes = Math.round(((24 - tempoDecorridoHoras) % 1) * 60);

    const resultado = `${horasRestantes}h ${minutosRestantes}min visível`;
    return resultado;
  },

  /**
   * Obtém o tempo restante de visibilidade usando FUNÇÃO SQL do banco
   * Mais preciso que o cálculo client-side
   */
  async getTempoRestanteVisibilidadeSQL(
    alertaId: string,
    status: string,
    concludedAt: string | null,
    fonte: 'tasks' | 'alertas_paciente'
  ): Promise<string | null> {
    try {

      // Chamar função SQL do Supabase
      const { data, error } = await supabase.rpc('tempo_restante_visibilidade', {
        p_status: status,
        p_hora_conclusao: concludedAt
      });

      if (error) {
        // Fallback: usar método local
        return null;
      }

      return data as string;
    } catch (error) {
      return null;
    }
  },

  /**
   * Verifica se um alerta é visível usando FUNÇÃO SQL do banco
   * Mais preciso que o cálculo client-side
   */
  async verificarVisibilidadeSQL(
    status: string,
    concludedAt: string | null
  ): Promise<boolean> {
    try {

      // Chamar função SQL do Supabase
      const { data, error } = await supabase.rpc('is_alerta_visible', {
        p_status: status,
        p_hora_conclusao: concludedAt
      });

      if (error) {
        // Fallback: usar método local
        return true;
      }

      return data as boolean;
    } catch (error) {
      return true; // Mostrar por padrão se houver erro
    }
  },
  async getAtivos(patientId: string): Promise<Alerta[]> {
    try {
      
      const allAlertas = await this.getAlertas(patientId);
      const ativos = allAlertas.filter(
        a => a.status !== 'concluido' && a.status !== 'Concluído'
      );
      
      return ativos;
    } catch (error) {
      logError(error, 'alertasService.getAtivos');
      return [];
    }
  },

  /**
   * Busca alertas visíveis (apenas ativos, sem arquivados)
   */
  async getVisiveis(patientId: string): Promise<Alerta[]> {
    try {
      
      const allAlertas = await this.getAlertas(patientId);
      const visiveis = allAlertas.filter(a => this.isAlertaVisible(a));
      
      return visiveis;
    } catch (error) {
      logError(error, 'alertasService.getVisiveis');
      return [];
    }
  },

  /**
   * Busca alertas fora do prazo
   */
  async getForaDoPrazo(patientId: string): Promise<Alerta[]> {
    try {
      
      const allAlertas = await this.getAlertas(patientId);
      const foraDoPrazo = allAlertas.filter(a => a.live_status === 'fora_do_prazo');
      
      return foraDoPrazo;
    } catch (error) {
      logError(error, 'alertasService.getForaDoPrazo');
      return [];
    }
  },

  /**
   * Atualiza a justificativa de um alerta com informações do usuário
   */
  async updateJustificativa(
    alertaId: string,
    justificativa: string,
    fonte: 'tasks' | 'alertas_paciente',
    justificadoPorUserId: string
  ): Promise<boolean> {
    try {

      const tableName = fonte === 'tasks' ? 'tasks' : 'alertas_paciente';
      
      // Verificar se é um UUID ou número
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(alertaId);
      const idAtualizacao = isUUID ? alertaId : parseInt(alertaId);

      // Nomes das colunas variam conforme a tabela
      const columnName = fonte === 'tasks' ? 'justification' : 'justificativa';
      const columnByName = fonte === 'tasks' ? 'justification_by' : 'justificativa_by';
      const columnAtName = fonte === 'tasks' ? 'justification_at' : 'justificativa_at';
      const agora = new Date().toISOString();

      // Atualizar com todos os campos de justificativa
      const { error, data } = await supabase
        .from(tableName)
        .update({
          [columnName]: justificativa,
          [columnByName]: justificadoPorUserId,
          [columnAtName]: agora,
          updated_at: agora
        })
        .eq('id', idAtualizacao)
        .select();

      if (error) {
        logError(error, `alertasService.updateJustificativa - ${tableName}`);
        return false;
      }

      if (!data || data.length === 0) {
        return false;
      }

      
      return true;
    } catch (error) {
      logError(error, 'alertasService.updateJustificativa');
      return false;
    }
  },

  /**
   * Marca um alerta como concluído com ID do usuário
   * Calcula concluded_at baseado no horário atual em São Paulo
   */
  async marcarComoConcluido(
    alertaId: string,
    fonte: 'tasks' | 'alertas_paciente',
    concludedByUserId: string
  ): Promise<boolean> {
    try {

      const tableName = fonte === 'tasks' ? 'tasks' : 'alertas_paciente';
      const agora = new Date().toISOString();

      // Converter ID se for string numérica
      const idAtualizacao = isNaN(Number(alertaId)) ? alertaId : parseInt(alertaId);

      // Marcar apenas como concluído (NÃO arquivar)
      const { error, data } = await supabase
        .from(tableName)
        .update({
          status: 'concluido',
          concluded_at: agora,
          concluded_by: concludedByUserId,
          updated_at: agora
        })
        .eq('id', idAtualizacao)
        .select();

      if (error) {
        logError(error, `alertasService.marcarComoConcluido - ${tableName}`);
        return false;
      }

      if (!data || data.length === 0) {
        return false;
      }

      
      return true;
    } catch (error) {
      logError(error, 'alertasService.marcarComoConcluido');
      return false;
    }
  },

  /**
   * Deleta um alerta
   */
  async deleteAlerta(alertaId: string, fonte: 'tasks' | 'alertas_paciente'): Promise<boolean> {
    try {

      const tableName = fonte === 'tasks' ? 'tasks' : 'alertas_paciente';

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', parseInt(alertaId));

      if (error) {
        logError(error, `alertasService.deleteAlerta - ${tableName}`);
        return false;
      }

      return true;
    } catch (error) {
      logError(error, 'alertasService.deleteAlerta');
      return false;
    }
  },

  /**
   * Arquiva um alerta (marca como archived) com ID do usuário que arquivou
   */
  async arquivarAlerta(
    alertaId: string,
    motivo: string,
    fonte: 'tasks' | 'alertas_paciente',
    archivedByUserId: string
  ): Promise<boolean> {
    try {

      const tableName = fonte === 'tasks' ? 'tasks' : 'alertas_paciente';
      const agora = new Date().toISOString();
      const idAtualizacao = isNaN(Number(alertaId)) ? alertaId : parseInt(alertaId);

      // Atualizar o alerta com dados de arquivamento
      const { error, data } = await supabase
        .from(tableName)
        .update({
          archived_at: agora,
          archived_by: archivedByUserId,
          motivo_arquivamento: motivo,
          status: 'arquivado',
          updated_at: agora
        })
        .eq('id', idAtualizacao)
        .select();

      if (error) {
        logError(error, `alertasService.arquivarAlerta - ${tableName}`);
        return false;
      }

      if (!data || data.length === 0) {
        return false;
      }

      
      return true;
    } catch (error) {
      logError(error, 'alertasService.arquivarAlerta');
      return false;
    }
  },

  /**
   * Busca alertas concluídos visíveis usando is_alerta_visible e tempo_restante_visibilidade do Supabase
   */
  async getConcluidos24h(patientId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('alertas_paciente_visibilidade_24h')
        .select('*')
        .eq('patient_id', patientId)
        .order('concluded_at', { ascending: false });

      if (error) return [];

      const alertas = data || [];

      const enriched = await Promise.all(
        alertas.map(async (alerta) => {
          const concludedAt = alerta.concluded_at ?? null;
          const [visivelRes, tempoRes] = await Promise.all([
            supabase.rpc('is_alerta_visible', {
              p_status: alerta.status,
              p_hora_conclusao: concludedAt
            }),
            supabase.rpc('tempo_restante_visibilidade', {
              p_status: alerta.status,
              p_hora_conclusao: concludedAt
            })
          ]);
          return {
            ...alerta,
            tempo_visibilidade: (tempoRes.data as string | null) ?? alerta.tempo_visibilidade,
            _is_visible: visivelRes.error ? true : (visivelRes.data as boolean)
          };
        })
      );

      return enriched.filter(a => a._is_visible);
    } catch (error) {
      logError(error, 'alertasService.getConcluidos24h');
      return [];
    }
  },

  /**
   * Busca alertas arquivados de um paciente (para histórico)
   */
  async getArquivados(patientId: string): Promise<Alerta[]> {
    try {

      // Busca diretamente das tabelas (não das views) para pegar arquivados
      const { data: tasksArquivados, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('patient_id', patientId)
        .not('archived_at', 'is', null)  // Apenas arquivados
        .order('archived_at', { ascending: false });

      if (tasksError) {
      }

      const { data: alertasArquivados, error: alertasError } = await supabase
        .from('alertas_paciente')
        .select('*')
        .eq('patient_id', patientId)
        .not('archived_at', 'is', null)  // Apenas arquivados
        .order('archived_at', { ascending: false });

      if (alertasError) {
      }

      return [];  // Retornar vazio ou formatado conforme necessário
    } catch (error) {
      logError(error, 'alertasService.getArquivados');
      return [];
    }
  }
};
