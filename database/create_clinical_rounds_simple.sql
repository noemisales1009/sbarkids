-- ============================================================================
-- CLINICAL ROUNDS SIMPLE (⭐ CRÍTICO - causa erro 406)
-- ============================================================================
CREATE TABLE public.clinical_rounds_simple (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  round_id uuid NULL,
  reference_date date NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  created_by uuid NULL DEFAULT auth.uid(),
  
  -- Assessment - Manhã
  assessment_morning text NULL,
  assessment_morning_saved_by uuid NULL,
  assessment_morning_saved_by_name text NULL,
  assessment_morning_saved_at timestamp with time zone NULL,
  
  -- Assessment - Tarde
  assessment_afternoon text NULL,
  assessment_afternoon_saved_by uuid NULL,
  assessment_afternoon_saved_by_name text NULL,
  assessment_afternoon_saved_at timestamp with time zone NULL,
  
  -- Assessment - Noite
  assessment_night text NULL,
  assessment_night_saved_by uuid NULL,
  assessment_night_saved_by_name text NULL,
  assessment_night_saved_at timestamp with time zone NULL,
  
  -- Recommendation - Manhã
  recommendation_morning text NULL,
  recommendation_morning_saved_by uuid NULL,
  recommendation_morning_saved_by_name text NULL,
  recommendation_morning_saved_at timestamp with time zone NULL,
  
  -- Recommendation - Tarde
  recommendation_afternoon text NULL,
  recommendation_afternoon_saved_by uuid NULL,
  recommendation_afternoon_saved_by_name text NULL,
  recommendation_afternoon_saved_at timestamp with time zone NULL,
  
  -- Recommendation - Noite
  recommendation_night text NULL,
  recommendation_night_saved_by uuid NULL,
  recommendation_night_saved_by_name text NULL,
  recommendation_night_saved_at timestamp with time zone NULL,
  
  -- Archival - quando arquivado, os dados digitados somem
  is_archived boolean NULL DEFAULT false,
  archived_at timestamp with time zone NULL,
  
  CONSTRAINT clinical_rounds_simple_pkey PRIMARY KEY (id),
  CONSTRAINT clinical_rounds_simple_assessment_morning_saved_by_fkey FOREIGN KEY (assessment_morning_saved_by) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT clinical_rounds_simple_assessment_afternoon_saved_by_fkey FOREIGN KEY (assessment_afternoon_saved_by) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT clinical_rounds_simple_assessment_night_saved_by_fkey FOREIGN KEY (assessment_night_saved_by) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT clinical_rounds_simple_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
  CONSTRAINT clinical_rounds_simple_recommendation_morning_saved_by_fkey FOREIGN KEY (recommendation_morning_saved_by) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT clinical_rounds_simple_recommendation_afternoon_saved_by_fkey FOREIGN KEY (recommendation_afternoon_saved_by) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT clinical_rounds_simple_recommendation_night_saved_by_fkey FOREIGN KEY (recommendation_night_saved_by) REFERENCES users (id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clinical_rounds_simple_patient_id ON public.clinical_rounds_simple USING btree (patient_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_clinical_rounds_simple_round_id ON public.clinical_rounds_simple USING btree (round_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_clinical_rounds_simple_is_archived ON public.clinical_rounds_simple USING btree (is_archived) TABLESPACE pg_default;