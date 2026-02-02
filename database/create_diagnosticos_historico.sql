-- Create diagnosticos_historico table
CREATE TABLE public.diagnosticos_historico (
  id bigserial NOT NULL,
  patient_id uuid NOT NULL,
  pergunta_id integer NOT NULL,
  opcao_id integer NOT NULL,
  texto_digitado text NULL,
  status text NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  opcao_label text NULL,
  created_by uuid NULL,
  arquivado boolean NULL DEFAULT false,
  CONSTRAINT diagnosticos_historico_pkey PRIMARY KEY (id),
  CONSTRAINT diagnosticos_historico_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id),
  CONSTRAINT diagnosticos_historico_opcao_id_fkey FOREIGN KEY (opcao_id) REFERENCES pergunta_opcoes_diagnostico (id) ON DELETE CASCADE,
  CONSTRAINT diagnosticos_historico_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
  CONSTRAINT diagnosticos_historico_pergunta_id_fkey FOREIGN KEY (pergunta_id) REFERENCES perguntas_diagnistico (id) ON DELETE CASCADE,
  CONSTRAINT diagnosticos_historico_status_check CHECK (
    status = ANY (ARRAY['resolvido'::text, 'nao_resolvido'::text])
  )
) TABLESPACE pg_default;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hist_pergunta_id ON public.diagnosticos_historico USING btree (pergunta_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_hist_opcao_id ON public.diagnosticos_historico USING btree (opcao_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_diagnosticos_historico_opcao_label ON public.diagnosticos_historico USING btree (opcao_label) TABLESPACE pg_default;
