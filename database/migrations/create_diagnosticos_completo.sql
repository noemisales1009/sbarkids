-- ============================================================================
-- Setup completo do sistema de Diagnósticos
-- Execute este SQL no console do Supabase
-- ============================================================================

-- ============================================================================
-- 1. CRIAR TABELA: perguntas_diagnistico
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.perguntas_diagnistico (
  id serial NOT NULL,
  titulo text NOT NULL,
  tipo text NOT NULL,
  CONSTRAINT perguntas_diagnistico_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- ============================================================================
-- 2. CRIAR TABELA: pergunta_opcoes_diagnostico  
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pergunta_opcoes_diagnostico (
  id serial NOT NULL,
  pergunta_id integer NOT NULL,
  label text NOT NULL,
  valor text NULL,
  CONSTRAINT pergunta_opcoes_diagnostico_pkey PRIMARY KEY (id),
  CONSTRAINT pergunta_opcoes_diagnostico_pergunta_id_fkey 
    FOREIGN KEY (pergunta_id) REFERENCES perguntas_diagnistico (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- ============================================================================
-- 3. CRIAR TABELA: paciente_diagnosticos (antiga diagnosticos_historico)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.paciente_diagnosticos (
  id serial NOT NULL,
  patient_id uuid NOT NULL,
  pergunta_id integer NOT NULL,
  opcao_id integer NOT NULL,
  texto_digitado text NULL,
  status text NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  created_by uuid NULL,
  CONSTRAINT paciente_diagnosticos_pkey PRIMARY KEY (id),
  CONSTRAINT paciente_diagnosticos_opcao_id_fkey 
    FOREIGN KEY (opcao_id) REFERENCES pergunta_opcoes_diagnostico (id) ON DELETE CASCADE,
  CONSTRAINT paciente_diagnosticos_patient_id_fkey 
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
  CONSTRAINT paciente_diagnosticos_pergunta_id_fkey 
    FOREIGN KEY (pergunta_id) REFERENCES perguntas_diagnistico (id) ON DELETE CASCADE,
  CONSTRAINT paciente_diagnosticos_status_check 
    CHECK (status = ANY (ARRAY['principal'::text, 'secundario'::text]))
) TABLESPACE pg_default;

-- Índices
CREATE INDEX IF NOT EXISTS idx_paciente_diagnosticos_patient_id 
  ON public.paciente_diagnosticos USING btree (patient_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_paciente_diagnosticos_pergunta_id 
  ON public.paciente_diagnosticos USING btree (pergunta_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_paciente_diagnosticos_opcao_id 
  ON public.paciente_diagnosticos USING btree (opcao_id) TABLESPACE pg_default;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_paciente_diagnosticos_modtime ON paciente_diagnosticos;

CREATE TRIGGER update_paciente_diagnosticos_modtime 
  BEFORE UPDATE ON paciente_diagnosticos 
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. CRIAR VIEW: diagnosticos_historico_com_usuario
-- ============================================================================
CREATE OR REPLACE VIEW public.diagnosticos_historico_com_usuario AS
SELECT
  pd.id,
  pd.patient_id,
  pd.pergunta_id,
  pd.opcao_id,
  pd.texto_digitado,
  pd.status,
  pd.created_at,
  po.label as opcao_label,
  pd.created_by,
  COALESCE(u.name, 'Sistema'::text) as created_by_name
FROM
  paciente_diagnosticos pd
  LEFT JOIN pergunta_opcoes_diagnostico po ON pd.opcao_id = po.id
  LEFT JOIN users u ON pd.created_by = u.id
ORDER BY
  pd.created_at DESC;

-- ============================================================================
-- 5. INSERIR DADOS DE EXEMPLO (Perguntas e Opções)
-- ============================================================================

-- Inserir pergunta de diagnóstico
INSERT INTO public.perguntas_diagnistico (id, titulo, tipo) 
VALUES 
  (1, 'Diagnóstico Principal', 'select'),
  (2, 'Diagnósticos Secundários', 'multiple')
ON CONFLICT (id) DO NOTHING;

-- Inserir opções comuns de diagnósticos pediátricos
INSERT INTO public.pergunta_opcoes_diagnostico (pergunta_id, label, valor) VALUES
  -- Para pergunta 1 (Principal)
  (1, 'Insuficiência Respiratória Aguda', 'ira'),
  (1, 'Pneumonia', 'pneumonia'),
  (1, 'Bronquiolite', 'bronquiolite'),
  (1, 'Sepse', 'sepse'),
  (1, 'Choque Séptico', 'choque_septico'),
  (1, 'Síndrome do Desconforto Respiratório Agudo (SDRA)', 'sdra'),
  (1, 'Pós-operatório de Cirurgia Cardíaca', 'pos_op_cardiaco'),
  (1, 'Cardiopatia Congênita', 'cardiopatia_congenita'),
  (1, 'Traumatismo Cranioencefálico (TCE)', 'tce'),
  (1, 'Meningite', 'meningite'),
  
  -- Para pergunta 2 (Secundários)
  (2, 'Insuficiência Respiratória Aguda', 'ira'),
  (2, 'Pneumonia', 'pneumonia'),
  (2, 'Bronquiolite', 'bronquiolite'),
  (2, 'Sepse', 'sepse'),
  (2, 'Choque Séptico', 'choque_septico'),
  (2, 'Síndrome do Desconforto Respiratório Agudo (SDRA)', 'sdra'),
  (2, 'Pós-operatório de Cirurgia Cardíaca', 'pos_op_cardiaco'),
  (2, 'Cardiopatia Congênita', 'cardiopatia_congenita'),
  (2, 'Traumatismo Cranioencefálico (TCE)', 'tce'),
  (2, 'Meningite', 'meningite'),
  (2, 'Desnutrição', 'desnutricao'),
  (2, 'Anemia', 'anemia'),
  (2, 'Insuficiência Renal Aguda', 'ira_renal'),
  (2, 'Distúrbio Hidroeletrolítico', 'disturbio_hidroeletrolitico'),
  (2, 'Coagulopatia', 'coagulopatia')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. HABILITAR RLS (Row Level Security)
-- ============================================================================
ALTER TABLE public.paciente_diagnosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perguntas_diagnistico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pergunta_opcoes_diagnostico ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. CRIAR POLÍTICAS DE ACESSO
-- ============================================================================

-- Políticas para paciente_diagnosticos
CREATE POLICY "Anon can read all paciente_diagnosticos"
ON public.paciente_diagnosticos FOR SELECT
TO anon
USING (true);

CREATE POLICY "Anon can insert paciente_diagnosticos"
ON public.paciente_diagnosticos FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Anon can update paciente_diagnosticos"
ON public.paciente_diagnosticos FOR UPDATE
TO anon
USING (true);

-- Políticas para perguntas_diagnistico
CREATE POLICY "Anon can read all perguntas_diagnistico"
ON public.perguntas_diagnistico FOR SELECT
TO anon
USING (true);

-- Políticas para pergunta_opcoes_diagnostico
CREATE POLICY "Anon can read all pergunta_opcoes_diagnostico"
ON public.pergunta_opcoes_diagnostico FOR SELECT
TO anon
USING (true);

-- ============================================================================
-- EXEMPLO DE INSERÇÃO DE DIAGNÓSTICO PARA UM PACIENTE
-- ============================================================================

-- Substitua 'SEU-PATIENT-ID-UUID' pelo ID real do paciente
-- Substitua 'SEU-USER-ID-UUID' pelo ID real do usuário/médico

-- Exemplo: Diagnóstico Principal
/*
INSERT INTO public.paciente_diagnosticos (patient_id, pergunta_id, opcao_id, status, created_by)
VALUES ('SEU-PATIENT-ID-UUID', 1, 2, 'principal', 'SEU-USER-ID-UUID');
*/

-- Exemplo: Diagnósticos Secundários
/*
INSERT INTO public.paciente_diagnosticos (patient_id, pergunta_id, opcao_id, status, created_by)
VALUES 
  ('SEU-PATIENT-ID-UUID', 2, 11, 'secundario', 'SEU-USER-ID-UUID'),
  ('SEU-PATIENT-ID-UUID', 2, 12, 'secundario', 'SEU-USER-ID-UUID');
*/

-- ============================================================================
-- CONSULTAS ÚTEIS PARA VERIFICAÇÃO
-- ============================================================================

-- Ver todos os diagnósticos de um paciente
-- SELECT * FROM diagnosticos_historico_com_usuario WHERE patient_id = 'SEU-PATIENT-ID-UUID';

-- Ver todas as opções disponíveis
-- SELECT * FROM pergunta_opcoes_diagnostico ORDER BY pergunta_id, label;

-- Contar diagnósticos por paciente
-- SELECT patient_id, status, COUNT(*) FROM paciente_diagnosticos GROUP BY patient_id, status;
