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
        // Não quebrar o app se a auditoria falhar
      }
    } catch {
      // Silenciar - auditoria não deve impedir o uso do app
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
};
