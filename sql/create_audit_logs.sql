-- Tabela de auditoria (LGPD)
-- Registra todas as ações dos usuários sobre dados de pacientes

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  action text NOT NULL,
  patient_id uuid NULL,
  patient_name text NULL,
  details text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
);

-- Index para consultas por paciente
CREATE INDEX IF NOT EXISTS idx_audit_logs_patient_id ON public.audit_logs (patient_id);

-- Index para consultas por usuário
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs (user_id);

-- Index para consultas por data
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

-- RLS: qualquer autenticado pode inserir (registrar ação)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_insert ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- RLS: apenas admin pode ler os logs
CREATE POLICY audit_logs_select ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'Administrador')
    )
  );

-- Ninguém pode editar ou deletar logs (imutáveis)
