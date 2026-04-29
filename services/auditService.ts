import { supabase } from '../lib/supabase';

/**
 * Serviço de trilha de auditoria (LGPD)
 *
 * Registra ações dos usuários sobre dados de pacientes.
 * Tabela: audit_logs
 */

export type AuditAction =
  | 'abriu_ficha'
  | 'salvou_assessment'
  | 'salvou_recommendation'
  | 'concluiu_alerta'
  | 'arquivou_alerta'
  | 'justificou_alerta'
  | 'criou_alerta'
  | 'visualizou_historico'
  | 'gerou_relatorio'
  | 'editou_paciente'
  | 'login'
  | 'logout';

interface AuditLogEntry {
  user_id: string;
  user_name: string;
  action: AuditAction;
  patient_id?: string | null;
  patient_name?: string | null;
  details?: string | null;
}

export const auditService = {
  /**
   * Registrar uma ação na trilha de auditoria
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert([{
          user_id: entry.user_id,
          user_name: entry.user_name,
          action: entry.action,
          patient_id: entry.patient_id || null,
          patient_name: entry.patient_name || null,
          details: entry.details || null,
          created_at: new Date().toISOString(),
        }]);

      if (error) {
        console.warn('[Audit] Falha ao registrar ação:', entry.action, error);
      }
    } catch (e) {
      console.warn('[Audit] Erro inesperado ao registrar ação:', entry.action, e);
    }
  },

  /**
   * Registrar acesso a ficha do paciente
   */
  async logAcessoFicha(userId: string, userName: string, patientId: string, patientName: string): Promise<void> {
    await this.log({
      user_id: userId,
      user_name: userName,
      action: 'abriu_ficha',
      patient_id: patientId,
      patient_name: patientName,
    });
  },

  /**
   * Registrar conclusão de alerta
   */
  async logConclusaoAlerta(userId: string, userName: string, patientId: string, patientName: string, alertaDescricao: string): Promise<void> {
    await this.log({
      user_id: userId,
      user_name: userName,
      action: 'concluiu_alerta',
      patient_id: patientId,
      patient_name: patientName,
      details: alertaDescricao,
    });
  },

  /**
   * Registrar login
   */
  async logLogin(userId: string, userName: string): Promise<void> {
    await this.log({
      user_id: userId,
      user_name: userName,
      action: 'login',
    });
  },

  /**
   * Registrar logout
   */
  async logLogout(userId: string, userName: string): Promise<void> {
    await this.log({
      user_id: userId,
      user_name: userName,
      action: 'logout',
    });
  },

  /**
   * Registrar salvamento de assessment
   */
  async logSalvouAssessment(userId: string, userName: string, patientId: string, patientName: string, turno: string): Promise<void> {
    await this.log({
      user_id: userId,
      user_name: userName,
      action: 'salvou_assessment',
      patient_id: patientId,
      patient_name: patientName,
      details: `Turno: ${turno}`,
    });
  },

  /**
   * Registrar salvamento de recommendation
   */
  async logSalvouRecommendation(userId: string, userName: string, patientId: string, patientName: string, turno: string): Promise<void> {
    await this.log({
      user_id: userId,
      user_name: userName,
      action: 'salvou_recommendation',
      patient_id: patientId,
      patient_name: patientName,
      details: `Turno: ${turno}`,
    });
  },

  /**
   * Registrar criação de alerta
   */
  async logCriouAlerta(userId: string, userName: string, patientId: string, patientName: string, alertaDescricao: string): Promise<void> {
    await this.log({
      user_id: userId,
      user_name: userName,
      action: 'criou_alerta',
      patient_id: patientId,
      patient_name: patientName,
      details: alertaDescricao,
    });
  },

  /**
   * Registrar arquivamento de alerta
   */
  async logArquivouAlerta(userId: string, userName: string, patientId: string, patientName: string, alertaDescricao: string, motivo: string): Promise<void> {
    await this.log({
      user_id: userId,
      user_name: userName,
      action: 'arquivou_alerta',
      patient_id: patientId,
      patient_name: patientName,
      details: `${alertaDescricao} | Motivo: ${motivo}`,
    });
  },

  /**
   * Registrar justificativa de alerta
   */
  async logJustificouAlerta(userId: string, userName: string, patientId: string, patientName: string, alertaDescricao: string): Promise<void> {
    await this.log({
      user_id: userId,
      user_name: userName,
      action: 'justificou_alerta',
      patient_id: patientId,
      patient_name: patientName,
      details: alertaDescricao,
    });
  },

  /**
   * Registrar edição de dados do paciente
   */
  async logEditouPaciente(userId: string, userName: string, patientId: string, patientName: string, campo: string): Promise<void> {
    await this.log({
      user_id: userId,
      user_name: userName,
      action: 'editou_paciente',
      patient_id: patientId,
      patient_name: patientName,
      details: `Campo: ${campo}`,
    });
  },

  /**
   * Registrar geração de relatório
   */
  async logGerouRelatorio(userId: string, userName: string, patientId: string, patientName: string): Promise<void> {
    await this.log({
      user_id: userId,
      user_name: userName,
      action: 'gerou_relatorio',
      patient_id: patientId,
      patient_name: patientName,
    });
  },
};
