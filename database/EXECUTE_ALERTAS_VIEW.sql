-- ============================================================================
-- EXECUTAR NO SUPABASE - SQL EDITOR
-- ============================================================================
-- Atualizar a view alertas_paciente_view_completa
-- ============================================================================

DROP VIEW IF EXISTS public.alertas_paciente_view_completa CASCADE;

CREATE VIEW public.alertas_paciente_view_completa AS
WITH pre_base AS (
  SELECT
    ap.id,
    ap.patient_id,
    ap.alerta_descricao,
    ap.responsavel,
    ap.hora_selecionada,
    ap.status,
    ap.justificativa,
    ap.created_at,
    ap.updated_at,
    ap.created_by,
    ap.justificativa_by,
    ap.justificativa_at,
    ap.status_conclusao,
    ap.archived_at,
    ap.archived_by,
    ap.motivo_arquivamento,
    ap.concluded_at,
    ap.concluded_by,
    get_shift(ap.created_at) AS shift_criacao,
    CASE
      WHEN regexp_replace(ap.hora_selecionada, '[^0-9]'::text, ''::text, 'g'::text) = ''::text
        THEN ap.created_at + '02:00:00'::interval
      ELSE ap.created_at + (regexp_replace(ap.hora_selecionada, '[^0-9]'::text, ''::text, 'g'::text) || ' hours'::text)::interval
    END AS deadline_calculado
  FROM alertas_paciente ap
),
base AS (
  SELECT
    t.id,
    t.patient_id,
    t.alerta_descricao,
    t.responsavel,
    t.hora_selecionada,
    t.status,
    t.justificativa,
    t.created_at,
    t.updated_at,
    t.created_by,
    t.justificativa_by,
    t.justificativa_at,
    t.status_conclusao,
    t.archived_at,
    t.archived_by,
    t.motivo_arquivamento,
    t.concluded_at,
    t.concluded_by,
    t.shift_criacao,
    t.deadline_calculado,
    p.name AS patient_name,
    p.bed_number,
    COALESCE(u.name, 'Não informado'::text) AS created_by_name,
    COALESCE(uc.name, 'Não informado'::text) AS concluded_by_name,
    ROUND(EXTRACT(epoch FROM t.deadline_calculado - t.created_at) / 60::numeric) AS prazo_minutos_efetivo
  FROM pre_base t
  LEFT JOIN patients p ON t.patient_id = p.id
  LEFT JOIN users u ON t.created_by = u.id
  LEFT JOIN users uc ON t.concluded_by = uc.id
)
SELECT
  id AS id_alerta,
  TO_CHAR((created_at AT TIME ZONE 'America/Sao_Paulo'::text), 'DD/MM/YYYY HH24:MI'::text) AS hora_criacao_formatado,
  patient_id,
  patient_name,
  bed_number,
  created_by_name,
  concluded_by_name,
  alerta_descricao AS alertaclinico,
  responsavel,
  -- Status: Se foi arquivado OU concluído, mostrar "resolvido / arquivado"
  CASE
    WHEN archived_at IS NOT NULL THEN 'resolvido / arquivado'::text
    WHEN status = 'concluido'::text THEN 'resolvido / arquivado'::text
    ELSE status
  END AS status,
  justificativa,
  created_at,
  deadline_calculado AS deadline,
  updated_at,
  archived_at,
  concluded_at,
  shift_criacao,
  TO_CHAR((deadline_calculado AT TIME ZONE 'America/Sao_Paulo'::text), 'DD/MM/YYYY HH24:MI'::text) AS prazo_limite_formatado,
  CASE
    WHEN prazo_minutos_efetivo >= 60::numeric 
      THEN (prazo_minutos_efetivo / 60::numeric)::integer || ' horas'::text
    ELSE prazo_minutos_efetivo || ' min'::text
  END AS prazo_formatado,
  -- live_status: Se foi arquivado OU concluído, mostrar "resolvido / arquivado"
  CASE
    WHEN archived_at IS NOT NULL THEN 'resolvido / arquivado'::text
    WHEN status = 'concluido'::text THEN 'resolvido / arquivado'::text
    WHEN deadline_calculado < NOW()
      AND (justificativa IS NULL OR justificativa = ''::text) 
      THEN 'fora_do_prazo'::text
    WHEN deadline_calculado < NOW()
      AND justificativa IS NOT NULL
      AND justificativa <> ''::text 
      THEN 'fora_do_prazo_com_justificativa'::text
    ELSE 'no_prazo'::text
  END AS live_status
FROM base;
