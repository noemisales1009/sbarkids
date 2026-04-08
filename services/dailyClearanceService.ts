import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

/**
 * Serviço para gerenciar a limpeza diária dos campos Assessment e Recommendation
 * Limpa os campos às 00:05 São Paulo para permitir novo preenchimento no dia seguinte
 * mantendo os dados anteriores salvos no histórico
 */

export const dailyClearanceService = {
  /**
   * Verificar se é hora de limpar (00:05 São Paulo)
   * Retorna true se está entre 00:00 e 00:10 (janela de 10 minutos para executar a limpeza)
   */
  isTimeForDailyClearance(): boolean {
    try {
      // Obter hora atual em São Paulo (UTC-3)
      const now = new Date();
      const spTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
      const hours = spTime.getHours();
      const minutes = spTime.getMinutes();

      // Considerar a janela de 00:00 a 00:10 (10 minutos)
      return hours === 0 && minutes <= 10;
    } catch (error) {
      return false;
    }
  },

  /**
   * Obter data de referência em São Paulo
   */
  getReferenceDate(): string {
    const now = new Date();
    const spTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    
    // Retornar data em formato YYYY-MM-DD
    const year = spTime.getFullYear();
    const month = String(spTime.getMonth() + 1).padStart(2, '0');
    const day = String(spTime.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  },

  /**
   * Limpar os campos de Assessment e Recommendation para um paciente
   * Mantém o histórico, apenas reseta os campos para que possam ser preenchidos novamente
   */
  async clearAssessmentAndRecommendation(patientId: string): Promise<boolean> {
    try {
      
      const today = this.getReferenceDate();
      
      // Buscar o registro de hoje
      const { data, error: selectError } = await supabase
        .from('clinical_rounds_simple')
        .select('id')
        .eq('patient_id', patientId)
        .eq('reference_date', today)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        return false;
      }

      // Se existe registro hoje, limpar os campos
      if (data) {
        const { error: updateError } = await supabase
          .from('clinical_rounds_simple')
          .update({
            assessment_morning: null,
            assessment_morning_saved_by_name: null,
            assessment_morning_saved_at: null,
            assessment_afternoon: null,
            assessment_afternoon_saved_by_name: null,
            assessment_afternoon_saved_at: null,
            assessment_night: null,
            assessment_night_saved_by_name: null,
            assessment_night_saved_at: null,
            recommendation_morning: null,
            recommendation_morning_saved_by_name: null,
            recommendation_morning_saved_at: null,
            recommendation_afternoon: null,
            recommendation_afternoon_saved_by_name: null,
            recommendation_afternoon_saved_at: null,
            recommendation_night: null,
            recommendation_night_saved_by_name: null,
            recommendation_night_saved_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id);

        if (updateError) {
          logError(updateError, 'dailyClearanceService.clearAssessmentAndRecommendation');
          return false;
        }

        return true;
      }

      // Se não existe registro hoje, nada a fazer
      return true;
    } catch (error) {
      logError(error, 'dailyClearanceService.clearAssessmentAndRecommendation');
      return false;
    }
  },

  /**
   * Limpar todos os pacientes ativos (00:05 São Paulo)
   * Deve ser chamado periodicamente ou via cron job
   */
  async clearAllPatients(): Promise<void> {
    try {
      if (!this.isTimeForDailyClearance()) {
        return;
      }


      // Buscar todos os pacientes únicos com registros hoje
      const today = this.getReferenceDate();
      const { data: patients, error } = await supabase
        .from('clinical_rounds_simple')
        .select('patient_id')
        .eq('reference_date', today);

      if (error) {
        logError(error, 'dailyClearanceService.clearAllPatients');
        return;
      }

      if (!patients || patients.length === 0) {
        return;
      }

      // Remover duplicatas
      const uniquePatientIds = [...new Set(patients.map(p => p.patient_id))];

      // Limpar cada paciente
      for (const patient_id of uniquePatientIds) {
        await this.clearAssessmentAndRecommendation(patient_id);
      }

    } catch (error) {
      logError(error, 'dailyClearanceService.clearAllPatients');
    }
  }
};

/**
 * Iniciar o serviço de limpeza diária
 * Deve ser chamado na inicialização da app (App.tsx ou em um contexto global)
 */
export const initializeDailyClearanceService = () => {

  // Verificar a cada 5 minutos se é hora de limpar
  const checkInterval = setInterval(() => {
    dailyClearanceService.clearAllPatients();
  }, 5 * 60 * 1000); // 5 minutos

  // Retornar função para desativar o intervalo
  return () => clearInterval(checkInterval);
};
