-- ============================================================
-- FIX: Adicionar RLS (Row Level Security) nas tabelas sem proteção
-- Data: 2026-03-24
-- Tabelas afetadas: medicacoes_pacientes, dispositivos_pacientes,
--   procedimentos_pacientes, assessment_shifts, recommendation_shifts,
--   round_audit_log, clinical_rounds, patients, alertas_paciente,
--   tasks, history, diurese, sbar_reports
-- ============================================================

-- ============================================================
-- 1. PATIENTS (tabela principal - base para todas as outras)
-- ============================================================
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own patients"
  ON public.patients FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can create patients"
  ON public.patients FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own patients"
  ON public.patients FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own patients"
  ON public.patients FOR DELETE
  USING (created_by = auth.uid());

-- ============================================================
-- 2. MEDICACOES_PACIENTES
-- ============================================================
ALTER TABLE public.medicacoes_pacientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view medications of their own patients"
  ON public.medicacoes_pacientes FOR SELECT
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can create medications for their own patients"
  ON public.medicacoes_pacientes FOR INSERT
  WITH CHECK (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can update medications of their own patients"
  ON public.medicacoes_pacientes FOR UPDATE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can delete medications of their own patients"
  ON public.medicacoes_pacientes FOR DELETE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

-- ============================================================
-- 3. DISPOSITIVOS_PACIENTES
-- ============================================================
ALTER TABLE public.dispositivos_pacientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view devices of their own patients"
  ON public.dispositivos_pacientes FOR SELECT
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can create devices for their own patients"
  ON public.dispositivos_pacientes FOR INSERT
  WITH CHECK (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can update devices of their own patients"
  ON public.dispositivos_pacientes FOR UPDATE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can delete devices of their own patients"
  ON public.dispositivos_pacientes FOR DELETE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

-- ============================================================
-- 4. PROCEDIMENTOS_PACIENTES
-- ============================================================
ALTER TABLE public.procedimentos_pacientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view procedures of their own patients"
  ON public.procedimentos_pacientes FOR SELECT
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can create procedures for their own patients"
  ON public.procedimentos_pacientes FOR INSERT
  WITH CHECK (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can update procedures of their own patients"
  ON public.procedimentos_pacientes FOR UPDATE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can delete procedures of their own patients"
  ON public.procedimentos_pacientes FOR DELETE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

-- ============================================================
-- 5. DIURESE
-- ============================================================
ALTER TABLE public.diurese ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view diurese of their own patients"
  ON public.diurese FOR SELECT
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can create diurese for their own patients"
  ON public.diurese FOR INSERT
  WITH CHECK (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can update diurese of their own patients"
  ON public.diurese FOR UPDATE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can delete diurese of their own patients"
  ON public.diurese FOR DELETE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

-- ============================================================
-- 6. ALERTAS_PACIENTE
-- ============================================================
ALTER TABLE public.alertas_paciente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alerts of their own patients"
  ON public.alertas_paciente FOR SELECT
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can create alerts for their own patients"
  ON public.alertas_paciente FOR INSERT
  WITH CHECK (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can update alerts of their own patients"
  ON public.alertas_paciente FOR UPDATE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can delete alerts of their own patients"
  ON public.alertas_paciente FOR DELETE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

-- ============================================================
-- 7. TASKS
-- ============================================================
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks of their own patients"
  ON public.tasks FOR SELECT
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can create tasks for their own patients"
  ON public.tasks FOR INSERT
  WITH CHECK (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can update tasks of their own patients"
  ON public.tasks FOR UPDATE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can delete tasks of their own patients"
  ON public.tasks FOR DELETE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

-- ============================================================
-- 8. SBAR_REPORTS
-- ============================================================
ALTER TABLE public.sbar_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sbar reports of their own patients"
  ON public.sbar_reports FOR SELECT
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can create sbar reports for their own patients"
  ON public.sbar_reports FOR INSERT
  WITH CHECK (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can update sbar reports of their own patients"
  ON public.sbar_reports FOR UPDATE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can delete sbar reports of their own patients"
  ON public.sbar_reports FOR DELETE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

-- ============================================================
-- 9. HISTORY
-- ============================================================
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view history of their own patients"
  ON public.history FOR SELECT
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can create history for their own patients"
  ON public.history FOR INSERT
  WITH CHECK (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can update history of their own patients"
  ON public.history FOR UPDATE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can delete history of their own patients"
  ON public.history FOR DELETE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

-- ============================================================
-- 10. CLINICAL_ROUNDS
-- ============================================================
ALTER TABLE public.clinical_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view clinical rounds of their own patients"
  ON public.clinical_rounds FOR SELECT
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can create clinical rounds for their own patients"
  ON public.clinical_rounds FOR INSERT
  WITH CHECK (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can update clinical rounds of their own patients"
  ON public.clinical_rounds FOR UPDATE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can delete clinical rounds of their own patients"
  ON public.clinical_rounds FOR DELETE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

-- ============================================================
-- 11. ASSESSMENT_SHIFTS
-- ============================================================
ALTER TABLE public.assessment_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assessment shifts of their own patients"
  ON public.assessment_shifts FOR SELECT
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can create assessment shifts for their own patients"
  ON public.assessment_shifts FOR INSERT
  WITH CHECK (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can update assessment shifts of their own patients"
  ON public.assessment_shifts FOR UPDATE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can delete assessment shifts of their own patients"
  ON public.assessment_shifts FOR DELETE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

-- ============================================================
-- 12. RECOMMENDATION_SHIFTS
-- ============================================================
ALTER TABLE public.recommendation_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recommendation shifts of their own patients"
  ON public.recommendation_shifts FOR SELECT
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can create recommendation shifts for their own patients"
  ON public.recommendation_shifts FOR INSERT
  WITH CHECK (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can update recommendation shifts of their own patients"
  ON public.recommendation_shifts FOR UPDATE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can delete recommendation shifts of their own patients"
  ON public.recommendation_shifts FOR DELETE
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

-- ============================================================
-- 13. ROUND_AUDIT_LOG
-- ============================================================
ALTER TABLE public.round_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs of their own patients"
  ON public.round_audit_log FOR SELECT
  USING (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

CREATE POLICY "Users can create audit logs for their own patients"
  ON public.round_audit_log FOR INSERT
  WITH CHECK (paciente_id IN (SELECT id FROM patients WHERE created_by = auth.uid()));

-- Audit logs should not be updatable or deletable
-- (preservar integridade do log de auditoria)
