import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

export interface DiagnosticoSelecionado {
  id?: number;
  patient_id: string;
  pergunta_id: number;
  opcao_id: number;
  texto_digitado?: string;
  status: 'resolvido' | 'nao_resolvido';
  created_at?: string;
  updated_at?: string;
}

/**
 * Serviço para gerenciar diagnósticos selecionados do paciente
 */
export const diagnosticosSelecionadosService = {
  /**
   * Salvar diagnósticos selecionados (UPSERT - atualiza existentes, insere novos)
   */
  async saveDiagnosticos(
    patientId: string,
    perguntaId: number,
    diagnosticos: any[]
  ): Promise<boolean> {
    try {
      if (!diagnosticos || diagnosticos.length === 0) {
        console.log('Nenhum diagnóstico para salvar');
        return true;
      }

      console.log('Salvando diagnósticos:', diagnosticos);

      // Preparar dados para UPSERT
      const data = diagnosticos.map(d => ({
        patient_id: patientId,
        pergunta_id: perguntaId,
        opcao_id: d.opcao_id,
        texto_digitado: d.valor_input || '',
        status: d.status === 'resolvido' ? 'resolvido' : 'nao_resolvido'
      }));

      console.log('Dados a salvar:', data);

      // UPSERT usando a sintaxe correta do Supabase
      const { data: result, error } = await supabase
        .from('paciente_diagnosticos')
        .upsert(data);

      if (error) {
        console.error('Erro ao salvar diagnósticos:', error);
        console.error('Detalhes do erro:', error.message, error.details);
        logError(error, 'diagnosticosSelecionadosService.saveDiagnosticos');
        return false;
      }

      console.log('✅ Diagnósticos salvos com sucesso!', result);
      return true;
    } catch (error) {
      console.error('Exception em saveDiagnosticos:', error);
      logError(error, 'diagnosticosSelecionadosService.saveDiagnosticos');
      return false;
    }
  },

  /**
   * Buscar diagnósticos selecionados de um paciente por pergunta
   */
  async getDiagnosticosPaciente(
    patientId: string,
    perguntaId: number
  ): Promise<DiagnosticoSelecionado[]> {
    try {
      const { data, error } = await supabase
        .from('paciente_diagnosticos')
        .select('*')
        .eq('patient_id', patientId)
        .eq('pergunta_id', perguntaId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar diagnósticos:', error);
        logError(error, 'diagnosticosSelecionadosService.getDiagnosticosPaciente');
        return [];
      }

      return (data || []) as DiagnosticoSelecionado[];
    } catch (error) {
      console.error('Exception em getDiagnosticosPaciente:', error);
      logError(error, 'diagnosticosSelecionadosService.getDiagnosticosPaciente');
      return [];
    }
  },

  /**
   * Atualizar status de um diagnóstico
   */
  async updateDiagnosticoStatus(
    patientId: string,
    opcaoId: number,
    perguntaId: number,
    status: 'resolvido' | 'nao_resolvido'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('paciente_diagnosticos')
        .update({ 
          status
        })
        .eq('patient_id', patientId)
        .eq('opcao_id', opcaoId)
        .eq('pergunta_id', perguntaId);

      if (error) {
        console.error('Erro ao atualizar diagnóstico:', error);
        logError(error, 'diagnosticosSelecionadosService.updateDiagnosticoStatus');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception em updateDiagnosticoStatus:', error);
      logError(error, 'diagnosticosSelecionadosService.updateDiagnosticoStatus');
      return false;
    }
  },

  /**
   * Deletar um diagnóstico
   */
  async deleteDiagnostico(
    patientId: string,
    opcaoId: number,
    perguntaId: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('paciente_diagnosticos')
        .delete()
        .eq('patient_id', patientId)
        .eq('opcao_id', opcaoId)
        .eq('pergunta_id', perguntaId);

      if (error) {
        console.error('Erro ao deletar diagnóstico:', error);
        logError(error, 'diagnosticosSelecionadosService.deleteDiagnostico');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception em deleteDiagnostico:', error);
      logError(error, 'diagnosticosSelecionadosService.deleteDiagnostico');
      return false;
    }
  }
};
