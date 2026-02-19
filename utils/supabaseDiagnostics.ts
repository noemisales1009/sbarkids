/**
 * Utilitário para diagnosticar problemas de conexão com Supabase
 */

import { supabase } from '../lib/supabase';

export const supabaseDiagnostics = {
  /**
   * Testar conexão básica com Supabase
   */
  async testConnection(): Promise<{
    connected: boolean;
    message: string;
    duration: number;
    details?: any;
  }> {
    try {
      const startTime = Date.now();
      
      // Teste simples: contar registros na tabela patients
      const { data, error, count } = await supabase
        .from('patients')
        .select('id', { count: 'exact', head: true });
      
      const duration = Date.now() - startTime;
      
      if (error) {
        return {
          connected: false,
          message: `❌ Erro ao conectar: ${error.message}`,
          duration,
          details: { code: error.code, message: error.message }
        };
      }
      
      return {
        connected: true,
        message: `✅ Conectado! Total de pacientes: ${count || 0} (tempo: ${duration}ms)`,
        duration,
        details: { patientCount: count }
      };
    } catch (error: any) {
      return {
        connected: false,
        message: `❌ Exceção: ${error.message}`,
        duration: 0,
        details: error
      };
    }
  },

  /**
   * Testar query de pacientes com diferentes limites
   */
  async testPatientQuery(limit: number = 50): Promise<{
    success: boolean;
    message: string;
    count: number;
    duration: number;
    error?: string;
  }> {
    try {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('bed_number', { ascending: true })
        .limit(limit);
      
      const duration = Date.now() - startTime;
      
      if (error) {
        return {
          success: false,
          message: `❌ Erro na query: ${error.message}`,
          count: 0,
          duration,
          error: error.message
        };
      }
      
      const count = data?.length || 0;
      return {
        success: true,
        message: `✅ Query bem-sucedida! Retornou ${count} pacientes em ${duration}ms`,
        count,
        duration
      };
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Exceção: ${error.message}`,
        count: 0,
        duration: 0,
        error: error.message
      };
    }
  },

  /**
   * Testar session do usuário
   */
  async testSession(): Promise<{
    authenticated: boolean;
    message: string;
    userId?: string;
    email?: string;
  }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        return {
          authenticated: false,
          message: `❌ Erro ao obter sessão: ${error.message}`
        };
      }
      
      if (!session) {
        return {
          authenticated: false,
          message: '❌ Nenhuma sessão ativa'
        };
      }
      
      return {
        authenticated: true,
        message: `✅ Usuário autenticado`,
        userId: session.user.id,
        email: session.user.email || undefined
      };
    } catch (error: any) {
      return {
        authenticated: false,
        message: `❌ Exceção: ${error.message}`
      };
    }
  },

  /**
   * Executar todos os testes
   */
  async runFullDiagnostics() {
    console.log('🔍 Iniciando diagnóstico completo do Supabase...\n');
    
    const session = await this.testSession();
    console.log('🔐 Autenticação:', session.message);
    
    const connection = await this.testConnection();
    console.log('🌐 Conexão:', connection.message);
    
    const query = await this.testPatientQuery(5);
    console.log('📊 Query de Pacientes:', query.message);
    
    // Resumo
    console.log('\n📋 RESUMO DIAGNÓSTICO:');
    console.log('- Autenticado:', session.authenticated ? '✅' : '❌');
    console.log('- Conectado:', connection.connected ? '✅' : '❌');
    console.log('- Query OK:', query.success ? '✅' : '❌');
    console.log('- Tempo de resposta:', query.duration + 'ms');
    
    return {
      session,
      connection,
      query,
      timestamp: new Date().toISOString()
    };
  }
};
