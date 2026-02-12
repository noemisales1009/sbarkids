import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação mais detalhada
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = '❌ ERRO CRÍTICO: Variáveis de ambiente Supabase não configuradas\n' +
    `   VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Definida' : '❌ Faltando'}\n` +
    `   VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Definida' : '❌ Faltando'}\n` +
    `   Certifique-se de que as variáveis estão configuradas nos arquivos .env ou na Vercel/Produção`;
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// Validação básica de formato
if (!supabaseUrl.includes('supabase.co')) {
  const urlError = `⚠️ URL do Supabase pode estar incorreta: ${supabaseUrl}`;
  console.error(urlError);
  throw new Error(urlError);
}

if (supabaseAnonKey.length < 100) {
  const keyError = `⚠️ Anon Key do Supabase parece muito curta (pode estar incorreta): ${supabaseAnonKey.substring(0, 20)}...`;
  console.error(keyError);
  throw new Error(keyError);
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: true
    }
  }
);

// Log de inicialização
console.log('🔧 Supabase Client inicializado');
console.log('   URL:', supabaseUrl?.substring(0, 30) + '...');
console.log('   Key:', supabaseAnonKey ? '✅ Presente' : '❌ Ausente');

