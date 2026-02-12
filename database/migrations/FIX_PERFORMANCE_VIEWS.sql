-- OTIMIZAÇÃO DE PERFORMANCE (Views lentas causando travamento no login)
-- Execute este script no SQL Editor do Supabase para corrigir a lentidão em produção.

-- 1. OTIMIZAÇÃO DA FUNÇÃO get_shift
-- Convertida para SQL puro para permitir que o banco de dados otimize a consulta (Inlining).
-- A versão anterior (PLPGSQL) forçava o banco a processar linha por linha de forma lenta.
CREATE OR REPLACE FUNCTION get_shift(hora timestamp with time zone) 
RETURNS text AS $$
SELECT CASE
    -- Extrai a hora já convertida para SP (UTC-3) de forma eficiente
    WHEN EXTRACT(HOUR FROM hora AT TIME ZONE 'America/Sao_Paulo') >= 7 
     AND EXTRACT(HOUR FROM hora AT TIME ZONE 'America/Sao_Paulo') < 13 THEN 'morning'
    WHEN EXTRACT(HOUR FROM hora AT TIME ZONE 'America/Sao_Paulo') >= 13 
     AND EXTRACT(HOUR FROM hora AT TIME ZONE 'America/Sao_Paulo') < 19 THEN 'afternoon'
    ELSE 'night' -- Cobre >= 19 ou < 7
  END;
$$ LANGUAGE sql IMMUTABLE;

-- 2. OTIMIZAÇÃO DA VIEW alertas_paciente_view_completa
-- Removeu regex desnecessários e CTEs complexas.
CREATE OR REPLACE VIEW public.alertas_paciente_view_completa AS
WITH pre_calculo AS (
  SELECT
    ap.id,
    ap.patient_id,
    ap.alerta_descricao,
    ap.responsavel,
    ap.status,
    ap.justificativa,
    ap.created_at,
    ap.updated_at,
    ap.created_by,
    ap.archived_at,
    -- Cálculo do deadline simplificado (evita Regex caro se possível)
    CASE
      -- Se for apenas números, assume horas
      WHEN ap.hora_selecionada ~ '^\d+$' THEN 
           ap.created_at + (ap.hora_selecionada || ' hours')::interval
      -- Fallback seguro
      ELSE ap.created_at + INTERVAL '2 hours'
    END AS deadline_calculado
  FROM alertas_paciente ap
),
base_join AS (
  SELECT
    t.*,
    get_shift(t.created_at) AS shift_criacao,
    p.name AS patient_name,
    p.bed_number,
    COALESCE(u.name, 'Não informado') AS created_by_name
  FROM pre_calculo t
  LEFT JOIN patients p ON t.patient_id = p.id
  LEFT JOIN users u ON t.created_by = u.id
)
SELECT
  id AS id_alerta,
  to_char(created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') AS hora_criacao_formatado,
  patient_id,
  patient_name,
  bed_number,
  created_by_name,
  alerta_descricao AS alertaclinico,
  responsavel,
  status,
  justificativa,
  created_at,
  deadline_calculado AS deadline,
  updated_at,
  archived_at,
  shift_criacao,
  to_char(deadline_calculado AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') AS prazo_limite_formatado,
  -- Lógica de status
  CASE
    WHEN status = 'concluido' THEN 'concluido'
    WHEN deadline_calculado < now() AND (justificativa IS NULL OR justificativa = '') THEN 'fora_do_prazo'
    WHEN deadline_calculado < now() THEN 'fora_do_prazo_com_justificativa'
    ELSE 'no_prazo'
  END AS live_status,
  -- Cálculo de prazo formatado mais leve
  CASE
    WHEN EXTRACT(EPOCH FROM (deadline_calculado - created_at)) >= 3600 THEN 
        (ROUND(EXTRACT(EPOCH FROM (deadline_calculado - created_at))/3600)::text || ' horas')
    ELSE 
        (ROUND(EXTRACT(EPOCH FROM (deadline_calculado - created_at))/60)::text || ' min')
  END AS prazo_formatado
FROM base_join;

-- 3. OTIMIZAÇÃO DA VIEW tasks_view_horario_br
CREATE OR REPLACE VIEW public.tasks_view_horario_br AS
WITH base_join AS (
  SELECT
    t.id,
    t.patient_id,
    p.name AS patient_name,
    p.bed_number,
    t.category_id,
    t.description,
    t.responsible,
    t.deadline,
    t.status,
    t.justification,
    t.created_at,
    t.updated_at,
    t.created_by,
    t.archived_at,
    COALESCE(u.name, 'Não informado') AS created_by_name
  FROM tasks t
  LEFT JOIN patients p ON t.patient_id = p.id
  LEFT JOIN users u ON t.created_by = u.id
),
calculos AS (
  SELECT
    b.*,
    get_shift(b.created_at) AS shift_criacao,
    -- Limpeza de string otimizada
    TRIM(REPLACE(REPLACE(
      CASE WHEN b.description LIKE '%-%' THEN right(b.description, length(b.description) - strpos(b.description, '-'))
      ELSE b.description END, 
      '°', ''), '-', '')
    ) AS descricao_limpa
  FROM base_join b
)
SELECT
  id AS id_alerta,
  patient_id,
  patient_name,
  bed_number,
  category_id,
  CASE
    WHEN descricao_limpa ILIKE '%AVALIAR BH%' THEN 1
    WHEN descricao_limpa ILIKE '%CONTROLE RIGOROSO DE PANI%' THEN 2
    WHEN descricao_limpa ILIKE '%OUTRAS::%' THEN 3
    ELSE 4
  END AS ordem_prioridade,
  descricao_limpa AS alertaclinico,
  responsible AS responsavel,
  status,
  justification AS justificativa,
  created_at,
  updated_at,
  deadline,
  archived_at,
  shift_criacao,
  created_at AT TIME ZONE 'America/Sao_Paulo' AS hora_criacao_br,
  to_char(created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') AS hora_criacao_formatado,
  deadline AT TIME ZONE 'America/Sao_Paulo' AS prazo_limite_br,
  to_char(deadline AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') AS prazo_limite_formatado,
  CASE
    WHEN status IN ('concluido', 'Concluído') THEN 'concluido'
    WHEN deadline < now() THEN 'fora_do_prazo'
    ELSE 'no_prazo'
  END AS live_status,
  CASE 
    WHEN status = 'alerta' THEN 
        CONCAT(ROUND(EXTRACT(EPOCH FROM (deadline - created_at))/3600), ' horas')
    ELSE '2 horas'
  END AS prazo_formatado,
  created_by_name
FROM calculos;
