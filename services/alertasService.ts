import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';
import { ShiftType, shiftFilterService } from './shiftFilterService';

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
  justification?: string | null;      // tasks (views antigas não renomeiam a coluna)
  justificativa_at?: string | null;   // alertas_paciente
  justification_at?: string | null;   // tasks
  shift_criacao?: ShiftType;
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
  sistemas?: string[];
}

const semAcento = (v?: string | null) =>
  (v || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');

/**
 * Alerta em aberto: não concluído, resolvido nem arquivado.
 */
export const isAlertaAtivo = (a: Alerta): boolean => {
  const s = semAcento(a.status);
  const ls = semAcento(a.live_status);
  return !a.concluded_at && s !== 'concluido' && s !== 'resolvido' &&
    !ls.includes('resolvido') && !ls.includes('concluido') && !ls.includes('arquivado');
};

/**
 * Turno em que o alerta foi criado.
 */
export const getShiftDoAlerta = (a: Alerta): ShiftType => {
  if (a.shift_criacao === 'morning' || a.shift_criacao === 'afternoon' || a.shift_criacao === 'night') {
    return a.shift_criacao;
  }
  const ref = a.created_at ? new Date(a.created_at) : new Date();
  return shiftFilterService.getShiftFromHour(ref.getHours());
};

/**
 * Horário em que o turno atual começou. O turno da noite atravessa a
 * meia-noite, então na madrugada o início é às 19h do dia anterior.
 */
export const getInicioTurnoAtual = (ref: Date = new Date()): Date => {
  const hora = ref.getHours();
  const inicio = new Date(ref);
  inicio.setMinutes(0, 0, 0);
  if (hora >= 7 && hora < 13) inicio.setHours(7);
  else if (hora >= 13 && hora < 19) inicio.setHours(13);
  else if (hora >= 19) inicio.setHours(19);
  else {
    inicio.setDate(inicio.getDate() - 1);
    inicio.setHours(19);
  }
  return inicio;
};

const INICIO_TURNO: Record<ShiftType, number> = { morning: 7, afternoon: 13, night: 19 };

/**
 * Alerta concluído continua na aba do seu turno até o próximo início desse
 * mesmo turno (ex: turno da manhã concluído às 10h some às 07h do dia seguinte).
 */
export const isConcluidoVisivel = (a: Alerta, agora: Date = new Date()): boolean => {
  if (a.archived_at || isAlertaAtivo(a)) return false;
  const quando = a.concluded_at || a.updated_at;
  if (!quando) return false;
  const concluido = new Date(quando);
  const fim = new Date(concluido);
  fim.setHours(INICIO_TURNO[getShiftDoAlerta(a)], 0, 0, 0);
  if (fim <= concluido) fim.setDate(fim.getDate() + 1);
  return agora < fim;
};

/**
 * Alerta aberto cujo prazo já venceu. As views marcam isso em live_status
 * ('fora_do_prazo' ou 'fora_do_prazo_com_justificativa'); o deadline cobre
 * o caso de a view ainda não ter recalculado.
 */
export const isForaDoPrazo = (a: Alerta, agora: Date = new Date()): boolean => {
  if (semAcento(a.live_status).includes('fora_do_prazo')) return true;
  return !!a.deadline && new Date(a.deadline) < agora;
};

/**
 * Alerta que trava a criação de um novo: está em aberto, já passou do prazo
 * e ainda não foi justificado dentro do turno atual. Aberto dentro do prazo
 * não trava. A justificativa vale só até virar o turno.
 */
export const precisaRevisao = (a: Alerta): boolean => {
  if (!isAlertaAtivo(a) || !isForaDoPrazo(a)) return false;
  const texto = a.justificativa || a.justification;
  const quando = a.justificativa_at || a.justification_at;
  if (!texto || !quando) return true;
  return new Date(quando) < getInicioTurnoAtual();
};

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
   * Completa justificativa e data da justificativa lendo direto das tabelas,
   * sem depender de quais colunas a view expõe.
   */
  async enriquecerJustificativas(alertas: Alerta[]): Promise<Alerta[]> {
    const idsAP = alertas.filter(a => a.fonte !== 'tasks').map(a => a.id_alerta);
    const idsT = alertas.filter(a => a.fonte === 'tasks').map(a => a.id_alerta);
    try {
      const [ap, t] = await Promise.all([
        idsAP.length
          ? supabase.from('alertas_paciente').select('id, justificativa, justificativa_at').in('id', idsAP)
          : Promise.resolve({ data: [], error: null }),
        idsT.length
          ? supabase.from('tasks').select('id, justification, justification_at').in('id', idsT)
          : Promise.resolve({ data: [], error: null }),
      ]);
      if (ap.error) logError(ap.error, 'alertasService.enriquecerJustificativas - alertas_paciente');
      if (t.error) logError(t.error, 'alertasService.enriquecerJustificativas - tasks');

      const porIdAP = new Map((ap.data || []).map((r: any) => [String(r.id), r]));
      const porIdT = new Map((t.data || []).map((r: any) => [String(r.id), r]));

      return alertas.map(a => {
        if (a.fonte === 'tasks') {
          const r = porIdT.get(String(a.id_alerta));
          return r ? { ...a, justificativa: r.justification ?? a.justificativa, justification_at: r.justification_at ?? a.justification_at } : a;
        }
        const r = porIdAP.get(String(a.id_alerta));
        return r ? { ...a, justificativa: r.justificativa ?? a.justificativa, justificativa_at: r.justificativa_at ?? a.justificativa_at } : a;
      });
    } catch (error) {
      logError(error, 'alertasService.enriquecerJustificativas');
      return alertas;
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
      const ativos = allAlertas.filter(a => {
        const ls = (a.live_status || '').toLowerCase();
        return ls !== 'concluído' && ls !== 'arquivado';
      });
      
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
