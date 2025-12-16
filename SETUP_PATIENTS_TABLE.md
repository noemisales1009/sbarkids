# ✅ Guia: Tabela Patients Já Existe

## 📋 Status da Configuração

A tabela `patients` já existe no Supabase com a estrutura correta. Não é necessário criar a tabela novamente.

## 🔧 Setup Necessário

### 1️⃣ Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://ouybwkjapejgpuuujwgy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91eWJ3a2phcGVqZ3B1dXVqd2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjQzMDYsImV4cCI6MjA3ODcwMDMwNn0.3JLJqAlW0oUCk3uprCz8j3dSSm95RG0dabXEKJbRPVo
```

### 2️⃣ Verificar RLS (Row Level Security)

No Supabase Dashboard, vá até a tabela `patients` e certifique-se de que RLS está habilitado com as políticas corretas.

Se não estiver, execute este SQL no Supabase SQL Editor:

```sql
-- Habilitar RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Anon can read all patients"
ON public.patients FOR SELECT
TO anon
USING (true);

CREATE POLICY "Anon can insert patients"
ON public.patients FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Anon can update patients"
ON public.patients FOR UPDATE
TO anon
USING (true);

CREATE POLICY "Anon can delete patients"
ON public.patients FOR DELETE
TO anon
USING (true);
```

### 3️⃣ Criar Tabela de Relatórios SBAR (se não existir)

Execute este SQL no Supabase:

```sql
-- Tabela de Relatórios SBAR
CREATE TABLE IF NOT EXISTS public.sbar_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  datetime timestamp with time zone DEFAULT NOW(),
  status text NOT NULL,
  
  -- Situação (S)
  diagnosis_principal text,
  diagnosis_secundarios text[],
  status_atual varchar(50),
  suportes_vigentes text[],
  drogas_vasoativas text,
  sedoanalgesia text,
  
  -- Background (B)
  background text,
  
  -- Assessment (A)
  assessment_morning text,
  assessment_afternoon text,
  assessment_night text,
  
  -- Recommendation (R)
  recommendation_morning text,
  recommendation_afternoon text,
  recommendation_night text,
  
  author text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW(),
  
  PRIMARY KEY (id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sbar_reports_patient_id ON public.sbar_reports USING btree (patient_id);
CREATE INDEX IF NOT EXISTS idx_sbar_reports_datetime ON public.sbar_reports USING btree (datetime DESC);
CREATE INDEX IF NOT EXISTS idx_sbar_reports_status ON public.sbar_reports USING btree (status);

-- Habilitar RLS
ALTER TABLE public.sbar_reports ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Anon can read all sbar_reports"
ON public.sbar_reports FOR SELECT
TO anon
USING (true);

CREATE POLICY "Anon can insert sbar_reports"
ON public.sbar_reports FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Anon can update sbar_reports"
ON public.sbar_reports FOR UPDATE
TO anon
USING (true);

CREATE POLICY "Anon can delete sbar_reports"
ON public.sbar_reports FOR DELETE
TO anon
USING (true);
```

## 📝 Estrutura de Campos (patients)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único (gerado automaticamente) |
| `name` | TEXT | Nome do paciente |
| `bed_number` | INTEGER | Número do leito |
| `mother_name` | TEXT | Nome da mãe |
| `dob` | DATE | Data de nascimento (YYYY-MM-DD) |
| `diagnosis` | TEXT | Diagnóstico principal |
| `status` | VARCHAR(50) | estavel, instavel, em_risco |
| `comorbidade` | TEXT | Comorbidades |
| `dt_internacao` | DATE | Data de internação (YYYY-MM-DD) |
| `peso` | NUMERIC | Peso em kg |
| `destino` | TEXT | Destino (alta, transferência, óbito) |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |
| `nomepaciente_norm` | TEXT | Nome normalizado (gerado) |

## 🚀 Serviços Disponíveis

### patientsService
```typescript
import { patientsService } from '@/services/patientsService';

// Listar todos
const patients = await patientsService.listPatients();

// Obter um
const patient = await patientsService.getPatient('id');

// Criar
const newPatient = await patientsService.createPatient({
  name: 'João Silva',
  bed_number: 101,
  mother_name: 'Maria Silva',
  dob: '2020-10-15',
  diagnosis: 'Pneumonia',
  status: 'estavel',
  dt_internacao: '2025-12-10',
  peso: 15.5
});

// Atualizar
const updated = await patientsService.updatePatient('id', {
  status: 'instavel'
});

// Buscar
const results = await patientsService.searchPatients('João');
```

### sbarService
```typescript
import { sbarService } from '@/services/sbarService';

// Listar relatórios de um paciente
const reports = await sbarService.getPatientReports('patient-id');

// Obter um relatório
const report = await sbarService.getReport('report-id');

// Criar relatório
const newReport = await sbarService.createReport({
  patient_id: 'id-do-paciente',
  datetime: new Date().toISOString(),
  status: 'Normal',
  description: 'Paciente estável',
  author: 'Dr. Silva',
  sbar: {
    situation: { /* ... */ },
    background: '...',
    assessment: { /* ... */ },
    recommendation: { /* ... */ }
  }
});
```

## 🧪 Testar Conexão

No navegador, abra o console (F12) e execute:

```javascript
import { supabase } from '@/lib/supabase';

// Testar conexão
const { data, error } = await supabase.from('patients').select('*');
console.log('Pacientes:', data);
console.log('Erro:', error);
```

## ✅ Checklist

- [ ] `.env.local` criado com as chaves corretas
- [ ] Tabela `patients` verificada no Supabase
- [ ] RLS habilitado em `patients`
- [ ] Tabela `sbar_reports` criada (se necessário)
- [ ] RLS habilitado em `sbar_reports`
- [ ] Teste de conexão feito com sucesso
- [ ] Componentes `PatientRoundHeader` e `SbarSituationSection` funcionando
