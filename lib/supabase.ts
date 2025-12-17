import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug para verificar se as variáveis estão definidas
console.log('🔍 Verificando variáveis de ambiente Supabase...');
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ AVISO: Variáveis de ambiente Supabase não configuradas!');
  console.warn('  VITE_SUPABASE_URL:', supabaseUrl ? '✅ configurada' : '❌ NÃO CONFIGURADA');
  console.warn('  VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ configurada' : '❌ NÃO CONFIGURADA');
  console.warn('  ℹ️ A aplicação funcionará em modo demonstração');
} else {
  console.log('✅ Variáveis de ambiente Supabase configuradas com sucesso');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

console.log('✅ Cliente Supabase inicializado');
