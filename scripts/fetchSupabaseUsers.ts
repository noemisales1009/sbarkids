import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchUsers() {
  try {
    console.log('📊 Buscando usuários do Supabase...\n');
    
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      console.error('❌ Erro ao buscar dados:', error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ Nenhum usuário encontrado na tabela');
      return;
    }

    console.log(`✅ Total de usuários: ${data.length}\n`);
    console.table(data);
    
  } catch (err) {
    console.error('❌ Erro:', err);
  }
}

fetchUsers();
