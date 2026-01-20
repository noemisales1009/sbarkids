-- ============================================================================
-- Setup de Diagnósticos - Tabelas e Views
-- Execute este SQL no console do Supabase
-- ============================================================================

-- ============================================================================
-- 1. Criar tabela perguntas_diagnistico (se não existir)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.perguntas_diagnistico (
  id serial NOT NULL,
  titulo text NOT NULL,
  tipo text NOT NULL,
  CONSTRAINT perguntas_diagnistico_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- ============================================================================
-- 2. Criar tabela diagnosticos_historico (se não existir)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.diagnosticos_historico (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  pergunta_id integer NULL,
  opcao_id uuid NULL,
  texto_digitado text NULL,
  status text NOT NULL DEFAULT 'secundario', -- 'principal' ou 'secundario'
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  opcao_label text NOT NULL,
  created_by uuid NULL,
  CONSTRAINT diagnosticos_historico_pkey PRIMARY KEY (id),
  CONSTRAINT diagnosticos_historico_patient_id_fkey FOREIGN KEY (patient_id) 
    REFERENCES patients (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Índices
CREATE INDEX IF NOT EXISTS idx_diagnosticos_historico_patient_id 
  ON public.diagnosticos_historico USING btree (patient_id);

CREATE INDEX IF NOT EXISTS idx_diagnosticos_historico_status 
  ON public.diagnosticos_historico USING btree (status);

-- ============================================================================
-- 3. Criar/Recriar a view diagnosticos_historico_com_usuario
-- ============================================================================
DROP VIEW IF EXISTS public.diagnosticos_historico_com_usuario;

CREATE VIEW public.diagnosticos_historico_com_usuario AS
SELECT
  dh.id,
  dh.patient_id,
  dh.pergunta_id,
  dh.opcao_id,
  dh.texto_digitado,
  dh.status,
  dh.created_at,
  dh.opcao_label,
  dh.created_by,
  COALESCE(u.name, 'Sistema'::text) AS created_by_name
FROM
  diagnosticos_historico dh
  LEFT JOIN users u ON dh.created_by = u.id
ORDER BY
  dh.created_at DESC;

-- ============================================================================
-- 4. Habilitar RLS (Row Level Security)
-- ============================================================================
ALTER TABLE public.diagnosticos_historico ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. Políticas de acesso
-- ============================================================================
CREATE POLICY "Anon can read all diagnosticos_historico"
ON public.diagnosticos_historico FOR SELECT
TO anon
USING (true);

CREATE POLICY "Anon can insert diagnosticos_historico"
ON public.diagnosticos_historico FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Anon can update diagnosticos_historico"
ON public.diagnosticos_historico FOR UPDATE
TO anon
USING (true);

CREATE POLICY "Anon can delete diagnosticos_historico"
ON public.diagnosticos_historico FOR DELETE
TO anon
USING (true);

-- ============================================================================
-- 6. Inserir dados de exemplo (opcional)
-- ============================================================================
-- IMPORTANTE: Substitua 'SEU-PATIENT-ID-AQUI' pelo UUID real do paciente

/*
-- Diagnóstico Principal
INSERT INTO public.diagnosticos_historico 
  (patient_id, opcao_label, status, created_by_name)
VALUES 
  ('SEU-PATIENT-ID-AQUI', 'Pneumonia Bacteriana', 'principal', 'Dr. Silva');

-- Diagnósticos Secundários
INSERT INTO public.diagnosticos_historico 
  (patient_id, opcao_label, status, created_by_name)
VALUES 
  ('SEU-PATIENT-ID-AQUI', 'Insuficiência Respiratória', 'secundario', 'Dra. Maria'),
  ('SEU-PATIENT-ID-AQUI', 'Desnutrição Moderada', 'secundario', 'Dr. João');
*/

-- ============================================================================
-- 7. Verificar dados
-- ============================================================================
-- SELECT * FROM public.diagnosticos_historico_com_usuario 
-- WHERE patient_id = 'SEU-PATIENT-ID-AQUI'
-- ORDER BY created_at DESC;
