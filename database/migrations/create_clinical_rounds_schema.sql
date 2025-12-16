-- ============================================================================
-- Criar tabela clinical_rounds com schema completo
-- Execute este SQL no console do Supabase
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.clinical_rounds (
  -- IDENTIFICAÇÃO DO ROUND
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NULL DEFAULT now(),
  
  -- VÍNCULO COM O PACIENTE (Chave estrangeira para a tabela patients)
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  -- QUEM FEZ O ROUND? (Armazenar o ID do médico/usuário)
  created_by uuid NULL,

  -- ====================================================
  -- S - SITUAÇÃO 
  -- ====================================================
  s_diagnosis_current text NULL, 
  s_clinical_status text NULL, 
  s_supports_active jsonb NULL, -- { "vm": true, "drogas": true... }

  -- ====================================================
  -- B - BACKGROUND (As fotos do momento)
  -- ====================================================
  b_medications_snapshot jsonb NULL, -- Cópia das medicações ativas
  b_devices_snapshot jsonb NULL,     -- Cópia dos dispositivos
  b_cultures_snapshot jsonb NULL,    -- Cópia das culturas
  b_procedures_snapshot jsonb NULL,  -- Cópia dos procedimentos
  
  b_days_hospitalized integer NULL,
  b_weaning_history text NULL,

  -- ====================================================
  -- A - AVALIAÇÃO 
  -- ====================================================
  a_resp_work text NULL,
  a_resp_parameters jsonb NULL,
  a_resp_gasometry text NULL, 
  
  a_hemo_vitals jsonb NULL,
  a_hemo_perfusion text NULL,
  
  a_neuro_sedation_goals text NULL,
  a_neuro_scales jsonb NULL, 
  
  a_renal_diuresis numeric(10,2) NULL,
  a_renal_fluid_balance numeric(10,2) NULL,
  a_renal_goals text NULL,
  
  a_risks_checklist jsonb NULL, 
  a_others_observation text NULL, 

  -- ====================================================
  -- R - RECOMENDAÇÃO / PLANO
  -- ====================================================
  r_plan_respiratory text NULL,
  r_plan_hemo text NULL,
  r_plan_neuro text NULL,
  r_plan_renal_nutri text NULL,
  
  -- ALERTAS E PENDÊNCIAS
  -- Aqui salvamos o histórico do que foi gerado
  r_generated_alerts jsonb NULL, 
  r_exams_evaluations_requests jsonb NULL, 
  r_pending_issues text NULL, 

  CONSTRAINT clinical_rounds_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- ============================================================================
-- Criar índices para melhor performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_clinical_rounds_patient_id 
  ON public.clinical_rounds USING btree (patient_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_clinical_rounds_created_at 
  ON public.clinical_rounds USING btree (created_at DESC) TABLESPACE pg_default;

-- ============================================================================
-- Criar tabelas de assessment_shifts e recommendation_shifts
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.assessment_shifts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES public.clinical_rounds(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- MANHÃ
  morning_data jsonb NULL,
  morning_saved_by uuid NULL,
  morning_saved_by_name text NULL,
  morning_saved_at timestamp with time zone NULL,
  
  -- TARDE
  afternoon_data jsonb NULL,
  afternoon_saved_by uuid NULL,
  afternoon_saved_by_name text NULL,
  afternoon_saved_at timestamp with time zone NULL,
  
  -- NOITE
  night_data jsonb NULL,
  night_saved_by uuid NULL,
  night_saved_by_name text NULL,
  night_saved_at timestamp with time zone NULL,
  
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  
  CONSTRAINT assessment_shifts_pkey PRIMARY KEY (id),
  CONSTRAINT assessment_shifts_round_id_key UNIQUE (round_id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_assessment_shifts_round_id 
  ON public.assessment_shifts USING btree (round_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_assessment_shifts_patient_id 
  ON public.assessment_shifts USING btree (patient_id) TABLESPACE pg_default;

-- ============================================================================

CREATE TABLE IF NOT EXISTS public.recommendation_shifts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES public.clinical_rounds(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- MANHÃ
  morning_data jsonb NULL,
  morning_saved_by uuid NULL,
  morning_saved_by_name text NULL,
  morning_saved_at timestamp with time zone NULL,
  
  -- TARDE
  afternoon_data jsonb NULL,
  afternoon_saved_by uuid NULL,
  afternoon_saved_by_name text NULL,
  afternoon_saved_at timestamp with time zone NULL,
  
  -- NOITE
  night_data jsonb NULL,
  night_saved_by uuid NULL,
  night_saved_by_name text NULL,
  night_saved_at timestamp with time zone NULL,
  
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  
  CONSTRAINT recommendation_shifts_pkey PRIMARY KEY (id),
  CONSTRAINT recommendation_shifts_round_id_key UNIQUE (round_id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_recommendation_shifts_round_id 
  ON public.recommendation_shifts USING btree (round_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_recommendation_shifts_patient_id 
  ON public.recommendation_shifts USING btree (patient_id) TABLESPACE pg_default;

-- ============================================================================
-- Criar tabela de auditoria para rastrear histórico de salvamentos
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.round_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES public.clinical_rounds(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- QUAL TURNO FOI SALVO
  shift text NOT NULL CHECK (shift IN ('morning', 'afternoon', 'night')),
  
  -- QUE TIPO DE DADO FOI SALVO
  data_type text NOT NULL CHECK (data_type IN ('assessment', 'recommendation')),
  
  -- QUEM SALVOU
  saved_by_id uuid NULL,
  saved_by_name text NOT NULL,
  
  -- OS DADOS QUE FORAM SALVOS
  saved_data jsonb NULL,
  
  -- QUANDO FOI SALVO
  saved_at timestamp with time zone NOT NULL DEFAULT now(),
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT round_audit_log_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_round_audit_log_round_id 
  ON public.round_audit_log USING btree (round_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_round_audit_log_patient_id 
  ON public.round_audit_log USING btree (patient_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_round_audit_log_shift 
  ON public.round_audit_log USING btree (shift) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_round_audit_log_saved_at 
  ON public.round_audit_log USING btree (saved_at DESC) TABLESPACE pg_default;
