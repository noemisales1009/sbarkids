import { supabase } from './lib/supabase';

console.log('🔍 DIAGNÓSTICO SUPABASE:');
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('ANON KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
console.log('Supabase Client:', supabase);

// Testar conexão
async function testConnection() {
  try {
    console.log('🧪 Testando conexão com Supabase...');
    const { data, error } = await supabase.from('patients').select('count');
    
    if (error) {
      console.error('❌ Erro na conexão:', error);
    } else {
      console.log('✅ Conexão OK!', data);
    }
  } catch (err) {
    console.error('❌ Erro ao testar:', err);
  }
}

testConnection();
