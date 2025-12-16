# 🏥 Round UTI Pediátrica - Estrutura Supabase

## SQL para Criar Tabelas

Execute este SQL no Supabase SQL Editor:

```sql
-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para remover acentos
CREATE OR REPLACE FUNCTION f_unaccent(text)
RETURNS text AS $$
SELECT unaccent($1)
$$ LANGUAGE sql IMMUTABLE;

-- Tabela de Pacientes
CREATE TABLE IF NOT EXISTS public.patients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bed_number integer NOT NULL,
  mother_name text,
  dob date NOT NULL,
  diagnosis text,
  status character varying(50) DEFAULT 'estavel',
  comorbidade text,
  dt_internacao date,
  peso numeric(10, 2),
  destino text,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW(),
  nomepaciente_norm text GENERATED ALWAYS AS (LOWER(f_unaccent(name))) STORED,
  PRIMARY KEY (id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients USING btree (status);
CREATE INDEX IF NOT EXISTS idx_patients_bed_number ON public.patients USING btree (bed_number);
CREATE INDEX IF NOT EXISTS idx_patients_nomepaciente_norm ON public.patients USING btree (nomepaciente_norm);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

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
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW(),
  
  PRIMARY KEY (id)
);

-- Índices para SBAR
CREATE INDEX IF NOT EXISTS idx_sbar_reports_patient_id ON public.sbar_reports USING btree (patient_id);
CREATE INDEX IF NOT EXISTS idx_sbar_reports_datetime ON public.sbar_reports USING btree (datetime DESC);
CREATE INDEX IF NOT EXISTS idx_sbar_reports_status ON public.sbar_reports USING btree (status);

-- Trigger para SBAR
CREATE TRIGGER update_sbar_reports_updated_at
BEFORE UPDATE ON public.sbar_reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

## 2️⃣ Habilitar Row Level Security (RLS)

```sql
-- Habilitar RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sbar_reports ENABLE ROW LEVEL SECURITY;

-- Políticas para patients
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

-- Políticas para sbar_reports
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
```

## 3️⃣ Estrutura de Dados TypeScript

### Patient (Paciente)
```typescript
interface Patient {
  id: string;                    // UUID
  name: string;                  // Nome do paciente
  bed_number: number;            // Número do leito
  mother_name: string | null;    // Nome da mãe
  dob: string;                   // Data de nascimento (YYYY-MM-DD)
  diagnosis: string | null;      // Diagnóstico principal
  status: 'estavel' | 'instavel' | 'em_risco';
  comorbidade: string | null;    // Comorbidades
  dt_internacao: string | null;  // Data de internação (YYYY-MM-DD)
  peso: number | null;           // Peso em kg
  destino: string | null;        // Destino (alta, transferência, óbito)
  created_at?: string;
  updated_at?: string;
}
```

### SBAR Situação (S)
```typescript
interface SbarSituation {
  diagnosis_principal: string;           // Ex: "Pneumonia bacteriana"
  diagnosis_secundarios: string[];       // Ex: ["Sepse", "Insuficiência renal"]
  status_atual: 'estavel' | 'instavel' | 'em_risco';
  suportes_vigentes: ('VM' | 'VNI' | 'O2')[]; // Ventilação mecânica, VNI, Oxigênio
  drogas_vasoativas: string;             // Ex: "Dobutamina 5mcg/kg/min"
  sedoanalgesia: string;                 // Ex: "Midazolam 0,1mg/kg/h"
}
```

## 4️⃣ Componentes Criados

### PatientRoundHeader
Exibe identificação rápida do paciente:
- Nome, Leito, Idade (calculada)
- Mãe, Data Nasc., Dias de internação
- Peso, Diagnóstico, Comorbidades

### SbarSituationSection
Edita a situação atual:
- Diagnósticos principal e secundários
- Status atual (botões Estável/Instável/Em Risco)
- Suportes vigentes (checkboxes VM/VNI/O2)
- Drogas vasoativas e sedoanalgesia

## 5️⃣ Exemplo de Uso

```typescript
import PatientRoundHeader from '@/components/round/PatientRoundHeader';
import SbarSituationSection from '@/components/round/SbarSituationSection';

const RoundPage = ({ patient }) => {
  const [situation, setSituation] = useState(patient.sbar.situation);

  return (
    <div className="space-y-4">
      <PatientRoundHeader patient={patient} />
      <SbarSituationSection 
        value={situation}
        onValueChange={setSituation}
      />
    </div>
  );
};
```

## 📊 Campos Calculados

### Idade
```typescript
const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();
```

### Dias de Internação (D.I.)
```typescript
const daysAdmitted = Math.ceil(
  (new Date().getTime() - new Date(patient.dt_internacao).getTime()) / 
  (1000 * 60 * 60 * 24)
);
```
