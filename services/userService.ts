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
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        logError(error, 'userService.getUserById');
        return null;
      }

      if (!user) {
        return null;
      }

      return user as UserData;
    } catch (error) {
      logError(error, 'userService.getUserById');
      return null;
    }
  },

  /**
   * Buscar usuário autenticado atualmente
   */
  async getCurrentUser(): Promise<UserData | null> {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      
      if (authError || !authUser) {
        logError(authError || new Error('No authenticated user'), 'userService.getCurrentUser');
        return null;
      }

      const userData = await this.getUserById(authUser.id);
      return userData;
    } catch (error) {
      logError(error, 'userService.getCurrentUser');
      return null;
    }
  }
};
