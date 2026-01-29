import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

export interface PerguntaDiagnostico {
  id: number;
  titulo: string;
  tipo: string;
  criado_por: string;
  criado_em: string;
}

export interface OpcaoDiagnostico {
  id: number;
  pergunta_id: number;
  codigo: string;
  label: string;
  has_input: boolean;
  input_placeholder: string | null;
  ordem: number;
  parent_id: number | null;
}

/**
 * Serviço para gerenciar perguntas e opções de diagnóstico
 */
export const diagnosticoPerguntasService = {
  /**
   * Listar todas as perguntas de diagnóstico
   */
  async getPerguntas(): Promise<PerguntaDiagnostico[]> {
    try {
      const { data, error } = await supabase
        .from('perguntas_diagnistico')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Erro ao carregar perguntas:', error);
        logError(error, 'diagnosticoPerguntasService.getPerguntas');
        return [];
      }

      return (data || []) as PerguntaDiagnostico[];
    } catch (error) {
      console.error('Exception em getPerguntas:', error);
      logError(error, 'diagnosticoPerguntasService.getPerguntas');
      return [];
    }
  },

  /**
   * Obter opções de uma pergunta (incluindo sub-opções hierarquicamente)
   */
  async getOpcoes(perguntaId: number): Promise<OpcaoDiagnostico[]> {
    try {
      // Buscar todas as opções (raízes e filhas)
      const { data, error } = await supabase
        .from('pergunta_opcoes_diagnostico')
        .select('*')
        .eq('pergunta_id', perguntaId)
        .order('ordem', { ascending: true });

      if (error) {
        console.error('Erro ao carregar opções:', error);
        logError(error, 'diagnosticoPerguntasService.getOpcoes');
        return [];
      }

      return (data || []) as OpcaoDiagnostico[];
    } catch (error) {
      console.error('Exception em getOpcoes:', error);
      logError(error, 'diagnosticoPerguntasService.getOpcoes');
      return [];
    }
  },

  /**
   * Criar nova opção
   */
  async createOpcao(data: Omit<OpcaoDiagnostico, 'id'>): Promise<OpcaoDiagnostico | null> {
    try {
      const { data: result, error } = await supabase
        .from('pergunta_opcoes_diagnostico')
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar opção:', error);
        logError(error, 'diagnosticoPerguntasService.createOpcao');
        return null;
      }

      return result as OpcaoDiagnostico;
    } catch (error) {
      console.error('Exception em createOpcao:', error);
      logError(error, 'diagnosticoPerguntasService.createOpcao');
      return null;
    }
  },

  /**
   * Atualizar opção
   */
  async updateOpcao(id: number, data: Partial<OpcaoDiagnostico>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pergunta_opcoes_diagnostico')
        .update(data)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar opção:', error);
        logError(error, 'diagnosticoPerguntasService.updateOpcao');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception em updateOpcao:', error);
      logError(error, 'diagnosticoPerguntasService.updateOpcao');
      return false;
    }
  },

  /**
   * Deletar opção
   */
  async deleteOpcao(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pergunta_opcoes_diagnostico')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar opção:', error);
        logError(error, 'diagnosticoPerguntasService.deleteOpcao');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception em deleteOpcao:', error);
      logError(error, 'diagnosticoPerguntasService.deleteOpcao');
      return false;
    }
  }
};
