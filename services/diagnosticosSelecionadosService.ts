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
        return true;
      }


      // Preparar dados para UPSERT
      const data = diagnosticos.map(d => ({
        patient_id: patientId,
        pergunta_id: perguntaId,
        opcao_id: d.opcao_id,
        texto_digitado: d.valor_input || '',
        status: d.status === 'resolvido' ? 'resolvido' : 'nao_resolvido'
      }));


      // Para cada diagnóstico: atualiza se já existe, insere se não existe
      for (const item of data) {
        const { data: existing } = await supabase
          .from('paciente_diagnosticos')
          .select('id')
          .eq('patient_id', item.patient_id)
          .eq('pergunta_id', item.pergunta_id)
          .eq('opcao_id', item.opcao_id)
          .limit(1);

        if (existing && existing.length > 0) {
          await supabase
            .from('paciente_diagnosticos')
            .update({ texto_digitado: item.texto_digitado, status: item.status })
            .eq('id', existing[0].id);
        } else {
          await supabase
            .from('paciente_diagnosticos')
            .insert([item]);
        }
      }

      const error = null;

      if (error) {
        logError(error, 'diagnosticosSelecionadosService.saveDiagnosticos');
        return false;
      }

      return true;
    } catch (error) {
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
        .from('diagnosticos_historico_com_usuario')
        .select('*')
        .eq('patient_id', patientId)
        .eq('pergunta_id', perguntaId)
        .eq('arquivado', false)
        .order('data_criacao', { ascending: false });

      if (error) {
        logError(error, 'diagnosticosSelecionadosService.getDiagnosticosPaciente');
        return [];
      }

      // Deduplicar por opcao_id (manter o mais recente de cada)
      const seen = new Set<number>();
      const deduped = (data || []).filter((d: any) => {
        if (seen.has(d.opcao_id)) return false;
        seen.add(d.opcao_id);
        return true;
      });

      return deduped as DiagnosticoSelecionado[];
    } catch (error) {
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
        logError(error, 'diagnosticosSelecionadosService.updateDiagnosticoStatus');
        return false;
      }

      return true;
    } catch (error) {
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
        logError(error, 'diagnosticosSelecionadosService.deleteDiagnostico');
        return false;
      }

      return true;
    } catch (error) {
      logError(error, 'diagnosticosSelecionadosService.deleteDiagnostico');
      return false;
    }
  }
};
