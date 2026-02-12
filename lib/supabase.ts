import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação mais detalhada
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO CRÍTICO: Variáveis de ambiente Supabase não configuradas');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅ Definida' : '❌ Faltando');
  console.error('   VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Definida' : '❌ Faltando');
  console.error('   Certifique-se de que as variáveis estão configuradas nos arquivos .env ou na Vercel');
}

// Validação básica de formato
if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
  console.warn('⚠️ URL do Supabase pode estar incorreta:', supabaseUrl);
}

if (supabaseAnonKey && supabaseAnonKey.length < 100) {
  console.warn('⚠️ Anon Key do Supabase parece muito curta (pode estar incorreta)');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Log de inicialização
console.log('🔧 Supabase Client inicializado');
console.log('   URL:', supabaseUrl?.substring(0, 30) + '...');
console.log('   Key:', supabaseAnonKey ? '✅ Presente' : '❌ Ausente');

