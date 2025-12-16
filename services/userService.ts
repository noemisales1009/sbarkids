import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandler';

export interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  sector: string | null;
  role: string | null;
  foto: string | null;
  access_level: string | null;
}

export const userService = {
  /**
   * Buscar dados do usuário pelo ID
   */
  async getUserById(userId: string): Promise<UserData | null> {
    try {
      console.log(`📍 userService.getUserById("${userId}") - buscando na tabela users...`);
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error(`❌ Erro ao buscar usuário ${userId}:`, error);
        logError(error, 'userService.getUserById');
        return null;
      }

      if (!user) {
        console.log(`❌ Nenhum registro encontrado para ID: ${userId}`);
        return null;
      }

      console.log(`✅ Usuário encontrado:`, user);
      return user as UserData;
    } catch (error) {
      console.error('❌ ERRO em getUserById:', error);
      logError(error, 'userService.getUserById');
      return null;
    }
  },

  /**
   * Buscar usuário autenticado atualmente
   */
  async getCurrentUser(): Promise<UserData | null> {
    try {
      console.log('📍 userService.getCurrentUser() - iniciando...');
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      console.log('📍 Auth result:', { userId: authUser?.id, email: authUser?.email, error: authError });
      
      if (authError || !authUser) {
        console.error('❌ Erro de autenticação:', authError || 'Nenhum usuário autenticado');
        logError(authError || new Error('No authenticated user'), 'userService.getCurrentUser');
        return null;
      }

      console.log('✅ Usuário autenticado encontrado, buscando dados na tabela users...');
      const userData = await this.getUserById(authUser.id);
      console.log('✅ Dados do usuário carregados:', userData);
      return userData;
    } catch (error) {
      console.error('❌ ERRO em getCurrentUser:', error);
      logError(error, 'userService.getCurrentUser');
      return null;
    }
  }
};
