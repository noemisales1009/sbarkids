# 🔗 Configuração Supabase

## 1️⃣ Setup Inicial

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://ouybwkjapejgpuuujwgy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91eWJ3a2phcGVqZ3B1dXVqd2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjQzMDYsImV4cCI6MjA3ODcwMDMwNn0.3JLJqAlW0oUCk3uprCz8j3dSSm95RG0dabXEKJbRPVo
```

## 2️⃣ Estrutura de Tabelas

### Tabela: `patients`
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  dob TEXT NOT NULL,
  bed TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  evolution TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `history`
```sql
CREATE TABLE history (
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

CREATE INDEX idx_history_patient_id ON history(patient_id);
CREATE INDEX idx_history_datetime ON history(datetime DESC);
```

## 3️⃣ Como Usar

### Serviço de Pacientes

```typescript
import { patientsService } from '@/services/patientsService';

// Listar todos os pacientes
const patients = await patientsService.listPatients();

// Obter um paciente
const patient = await patientsService.getPatient('id-do-paciente');

// Criar novo paciente
const newPatient = await patientsService.createPatient({
  name: 'João Silva',
  status: 'Estável',
  dob: '15/10/2020',
  bed: 'Leito 101',
  motherName: 'Maria Silva',
  evolution: 'Paciente estável'
});

// Atualizar paciente
const updated = await patientsService.updatePatient('id', {
  status: 'Crítico',
  evolution: 'Novo texto'
});

// Deletar paciente
const deleted = await patientsService.deletePatient('id');

// Buscar pacientes
const results = await patientsService.searchPatients('João');
```

### Serviço de Histórico

```typescript
import { historyService } from '@/services/historyService';

// Obter histórico de um paciente
const history = await historyService.getPatientHistory('patient-id');

// Obter relatório específico
const report = await historyService.getReport('report-id');

// Criar novo relatório
const newReport = await historyService.createReport({
  patient_id: 'id-do-paciente',
  datetime: '16/12/2025 14:30',
  status: 'Normal',
  description: 'Paciente está bem',
  author: 'Dr. Silva',
  sbar: {
    situation: '...',
    background: '...',
    assessment: { morning: '...', afternoon: '...', night: '...' },
    recommendation: { morning: '...', afternoon: '...', night: '...' }
  }
});

// Atualizar relatório
const updated = await historyService.updateReport('report-id', {
  status: 'Crítico'
});

// Listar todos os relatórios
const allReports = await historyService.getAllReports(50, 0);

// Filtrar por status
const urgent = await historyService.getReportsByStatus('Urgente');
```

### Hooks React

```typescript
import { useSupabaseRealtimeList, useSupabaseItem, useSupabaseMutation } from '@/hooks/useSupabase';

// Hook para listar com real-time
const MyComponent = () => {
  const { data: patients, loading, error } = useSupabaseRealtimeList('patients');

  return (
    <div>
      {loading && <p>Carregando...</p>}
      {error && <p>Erro: {error}</p>}
      {patients.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  );
};

// Hook para obter um item
const PatientDetail = ({ patientId }) => {
  const { data: patient, loading } = useSupabaseItem('patients', patientId);

  return loading ? <p>Carregando...</p> : <p>{patient?.name}</p>;
};

// Hook para mutações
const CreatePatient = () => {
  const { insert, loading, error } = useSupabaseMutation('patients');

  const handleCreate = async () => {
    const result = await insert({
      name: 'Novo Paciente',
      status: 'Estável',
      dob: '01/01/2020',
      bed: 'Leito 101',
      mother_name: 'Mãe',
      evolution: 'Bem'
    });

    if (result.success) {
      console.log('Criado:', result.data);
    } else {
      console.error('Erro:', result.error);
    }
  };

  return <button onClick={handleCreate}>{loading ? 'Salvando...' : 'Criar'}</button>;
};
```

## 4️⃣ Configurar Row Level Security (RLS)

No Supabase:

1. Vá para **Authentication** > **Policies**
2. Crie políticas para cada tabela

### Política para `patients` (Anon)
```sql
CREATE POLICY "Anon can read all patients"
ON patients FOR SELECT TO anon
USING (true);

CREATE POLICY "Anon can insert patients"
ON patients FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Anon can update patients"
ON patients FOR UPDATE TO anon
USING (true);
```

### Política para `history` (Anon)
```sql
CREATE POLICY "Anon can read all history"
ON history FOR SELECT TO anon
USING (true);

CREATE POLICY "Anon can insert history"
ON history FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Anon can update history"
ON history FOR UPDATE TO anon
USING (true);
```

## 5️⃣ Real-Time

Para ativar real-time no Supabase:

1. Vá até a tabela em **Table Editor**
2. Clique em **⚡ Realtime** (ícone no canto superior)
3. Ative para as tabelas que deseja

## ⚠️ Segurança

- ⛔ **NUNCA** commit `.env.local` no git
- 🔐 Use `service_role` apenas no servidor
- 🔑 Mantenha a chave anônica (anon) segura
- ✅ Configure RLS no Supabase para todas as tabelas

## 🧪 Testar Conexão

Execute no console do navegador:

```javascript
import { supabase } from '@/lib/supabase';

// Testar conexão
const { data, error } = await supabase.from('patients').select('*');
console.log(data, error);
```
