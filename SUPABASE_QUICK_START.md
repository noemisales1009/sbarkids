# ✅ Guia Rápido: Conectar Supabase

## 1️⃣ Arquivo `.env.local`

Crie na raiz do projeto:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 2️⃣ Criar Tabelas no Supabase

SQL para executar no Supabase SQL Editor:

```sql
-- Tabela de Pacientes
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Crítico', 'Estável', 'Observação')),
  dob TEXT NOT NULL,
  bed TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  evolution TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Histórico/Relatórios
CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  datetime TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT,
  author TEXT NOT NULL,
  sbar JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_history_patient_id ON history(patient_id);
CREATE INDEX IF NOT EXISTS idx_history_datetime ON history(datetime DESC);
```

## 3️⃣ Ativar Row Level Security (RLS)

No Supabase Dashboard:

1. Vá para **Authentication** → **Policies**
2. Para a tabela `patients`, clique em **+ New Policy**
3. Crie esta política:

```sql
CREATE POLICY "Enable read access for all users"
ON patients FOR SELECT
USING (true);

CREATE POLICY "Enable insert access for all users"
ON patients FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
ON patients FOR UPDATE
USING (true);
```

Repita para a tabela `history`.

## 4️⃣ Usar nos Componentes

### Exemplo: PatientList com Supabase

```typescript
import { useSupabaseRealtimeList } from '@/hooks/useSupabase';

export const PatientList = () => {
  const { data: patients, loading, error } = useSupabaseRealtimeList('patients');

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div>
      {patients.map(p => (
        <PatientCard key={p.id} patient={p} />
      ))}
    </div>
  );
};
```

### Exemplo: Criar Novo Paciente

```typescript
import { useSupabaseMutation } from '@/hooks/useSupabase';

export const CreatePatientForm = () => {
  const { insert, loading, error } = useSupabaseMutation('patients');

  const handleCreate = async (formData) => {
    const result = await insert({
      name: formData.name,
      status: 'Estável',
      dob: formData.dob,
      bed: formData.bed,
      mother_name: formData.motherName,
      evolution: formData.evolution
    });

    if (result.success) {
      console.log('Paciente criado!', result.data);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleCreate({ /* dados */ });
    }}>
      {/* Formulário */}
      <button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};
```

## 5️⃣ Estrutura de Arquivos

```
lib/
  └── supabase.ts          # Cliente Supabase

services/
  ├── patientsService.ts   # CRUD de pacientes
  └── historyService.ts    # CRUD de histórico

hooks/
  └── useSupabase.ts       # Hooks React

examples/
  └── SupabaseIntegration.tsx  # Exemplos
```

## 🔐 Segurança

✅ **Fazer:**
- [ ] Adicionar `.env.local` ao `.gitignore`
- [ ] Usar RLS em produção
- [ ] Validar dados no cliente e servidor

❌ **Não fazer:**
- [ ] Commitar `.env.local`
- [ ] Expor a chave `service_role`
- [ ] Confiar apenas em validação do cliente

## 📚 Documentação

- [Supabase Docs](https://supabase.com/docs)
- [Arquivo completo de setup](./SUPABASE_SETUP.md)
- [Exemplos de integração](./examples/SupabaseIntegration.tsx)
