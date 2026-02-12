-- Criar função para determinar turno (shift) baseado na hora
CREATE OR REPLACE FUNCTION get_shift(hora timestamp with time zone) 
RETURNS text AS $$
DECLARE
  hora_br timestamp;
  hora_apenas integer;
BEGIN
  -- Converter para horário de São Paulo
  hora_br := hora AT TIME ZONE 'America/Sao_Paulo';
  hora_apenas := EXTRACT(HOUR FROM hora_br);
  
  -- Determinar turno
  CASE
    WHEN hora_apenas >= 7 AND hora_apenas < 13 THEN
      RETURN 'morning';
    WHEN hora_apenas >= 13 AND hora_apenas < 19 THEN
      RETURN 'afternoon';
    WHEN hora_apenas >= 19 OR hora_apenas < 7 THEN
      RETURN 'night';
    ELSE
      RETURN 'unknown';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Ver com turno adicionado ao alertas
CREATE OR REPLACE VIEW public.alertas_paciente_view_completa AS
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
    get_shift(ap.created_at) AS shift_criacao,
    CASE
      WHEN regexp_replace(
        ap.hora_selecionada,
        '[^0-9]'::text,
        ''::text,
        'g'::text
      ) = ''::text THEN ap.created_at + '02:00:00'::interval
      ELSE ap.created_at + (
        (
          regexp_replace(
            ap.hora_selecionada,
            '[^0-9]'::text,
            ''::text,
            'g'::text
          ) || ' hours'::text
        )::interval
      )
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
    t.deadline_calculado,
    t.shift_criacao,
    p.name AS patient_name,
    p.bed_number,
    COALESCE(u.name, 'Não informado'::text) AS created_by_name,
    ROUND(
      EXTRACT(
        EPOCH
        FROM t.deadline_calculado - t.created_at
      ) / 60::numeric
    ) AS prazo_minutos_efetivo
  FROM pre_base t
  LEFT JOIN patients p ON t.patient_id = p.id
  LEFT JOIN users u ON t.created_by = u.id
)
SELECT
  id AS id_alerta,
  to_char(
    (created_at AT TIME ZONE 'America/Sao_Paulo'::text),
    'DD/MM/YYYY HH24:MI'::text
  ) AS hora_criacao_formatado,
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
  to_char(
    (
      deadline_calculado AT TIME ZONE 'America/Sao_Paulo'::text
    ),
    'DD/MM/YYYY HH24:MI'::text
  ) AS prazo_limite_formatado,
  CASE
    WHEN prazo_minutos_efetivo >= 60::numeric THEN (prazo_minutos_efetivo / 60::numeric)::integer || ' horas'::text
    ELSE prazo_minutos_efetivo || ' min'::text
  END AS prazo_formatado,
  CASE
    WHEN status = 'concluido'::text THEN 'concluido'::text
    WHEN deadline_calculado < now()
    AND (
      justificativa IS NULL
      OR justificativa = ''::text
    ) THEN 'fora_do_prazo'::text
    WHEN deadline_calculado < now()
    AND justificativa IS NOT NULL
    AND justificativa <> ''::text THEN 'fora_do_prazo_com_justificativa'::text
    ELSE 'no_prazo'::text
  END AS live_status
FROM base;

-- View com turno adicionado às tarefas
CREATE OR REPLACE VIEW public.tasks_view_horario_br AS
WITH base AS (
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
    get_shift(t.created_at) AS shift_criacao,
    CASE
      WHEN t.status = 'alerta'::text THEN EXTRACT(
        EPOCH
        FROM t.deadline - t.created_at
      ) / 60::numeric
      ELSE 120::numeric
    END AS prazo_minutos_efetivo
  FROM tasks t
  LEFT JOIN patients p ON t.patient_id = p.id
),
calc AS (
  SELECT
    b.id,
    b.patient_id,
    b.patient_name,
    b.bed_number,
    b.category_id,
    b.description,
    b.responsible,
    b.deadline,
    b.status,
    b.justification,
    b.created_at,
    b.updated_at,
    b.created_by,
    b.archived_at,
    b.shift_criacao,
    b.prazo_minutos_efetivo,
    COALESCE(u.name, 'Não informado'::text) AS created_by_name,
    (
      b.created_at AT TIME ZONE 'America/Sao_Paulo'::text
    ) AS hora_criacao_br,
    (b.deadline AT TIME ZONE 'America/Sao_Paulo'::text) AS prazo_limite_br,
    CASE
      WHEN b.status = ANY (ARRAY['concluido'::text, 'Concluído'::text]) THEN (
        b.updated_at AT TIME ZONE 'America/Sao_Paulo'::text
      )
      ELSE NULL::timestamp without time zone
    END AS hora_conclusao_br,
    to_char(
      (
        b.created_at AT TIME ZONE 'America/Sao_Paulo'::text
      ),
      'HH24:MI'::text
    ) AS hora_criacao_hhmm,
    to_char(
      (
        b.created_at AT TIME ZONE 'America/Sao_Paulo'::text
      ),
      'DD/MM/YYYY HH24:MI'::text
    ) AS hora_criacao_formatado,
    to_char(
      (b.deadline AT TIME ZONE 'America/Sao_Paulo'::text),
      'HH24:MI'::text
    ) AS prazo_limite_hhmm,
    CASE
      WHEN b.status = ANY (ARRAY['concluido'::text, 'Concluído'::text]) THEN to_char(
        (
          b.updated_at AT TIME ZONE 'America/Sao_Paulo'::text
        ),
        'HH24:MI'::text
      )
      ELSE NULL::text
    END AS hora_conclusao_hhmm,
    to_char(
      (b.deadline AT TIME ZONE 'America/Sao_Paulo'::text),
      'DD/MM/YYYY HH24:MI'::text
    ) AS prazo_limite_formatado,
    CASE
      WHEN b.status = ANY (ARRAY['concluido'::text, 'Concluído'::text]) THEN 'concluido'::text
      WHEN b.deadline < now() THEN 'fora_do_prazo'::text
      ELSE 'no_prazo'::text
    END AS live_status,
    (
      WITH iv AS (
        SELECT
          justify_interval(
            make_interval(mins => b.prazo_minutos_efetivo::integer)
          ) AS iv
      )
      SELECT
        TRIM(
          BOTH ' '::text
          FROM concat_ws(
            ' '::text,
            CASE
              WHEN EXTRACT(
                HOUR
                FROM iv.iv
              )::integer <> 0 THEN (
                EXTRACT(
                  HOUR
                  FROM iv.iv
                )::integer || ' hora'::text
              ) || CASE
                WHEN EXTRACT(
                  HOUR
                  FROM iv.iv
                ) = 1::numeric THEN ''::text
                ELSE 's'::text
              END
              ELSE NULL::text
            END,
            CASE
              WHEN EXTRACT(
                MINUTE
                FROM iv.iv
              )::integer <> 0 THEN EXTRACT(
                MINUTE
                FROM iv.iv
              )::integer || ' min'::text
              ELSE NULL::text
            END
          )
        ) AS btrim
      FROM iv
    ) AS prazo_formatado
  FROM base b
  LEFT JOIN users u ON b.created_by = u.id
),
limpeza_de_prefixos AS (
  SELECT
    c.id,
    c.patient_id,
    c.patient_name,
    c.bed_number,
    c.category_id,
    c.description,
    c.responsible,
    c.deadline,
    c.status,
    c.justification,
    c.created_at,
    c.updated_at,
    c.created_by,
    c.archived_at,
    c.shift_criacao,
    c.prazo_minutos_efetivo,
    c.created_by_name,
    c.hora_criacao_br,
    c.prazo_limite_br,
    c.hora_conclusao_br,
    c.hora_criacao_hhmm,
    c.hora_criacao_formatado,
    c.prazo_limite_hhmm,
    c.hora_conclusao_hhmm,
    c.prazo_limite_formatado,
    c.live_status,
    c.prazo_formatado,
    TRIM(
      BOTH
      FROM replace(
        replace(
          TRIM(
            BOTH
            FROM CASE
              WHEN c.description ~~ '%-%'::text THEN "substring" (
                c.description,
                POSITION(('-'::text) in (c.description)) + 1
              )
              ELSE c.description
            END
          ),
          '°'::text,
          ''::text
        ),
        '-'::text,
        ''::text
      )
    ) AS descricao_limpa
  FROM calc c
)
SELECT
  id AS id_alerta,
  patient_id,
  patient_name,
  bed_number,
  category_id,
  CASE
    WHEN descricao_limpa ~~* '%AVALIAR BH%'::text THEN 1
    WHEN descricao_limpa ~~* '%CONTROLE RIGOROSO DE PANI%'::text THEN 2
    WHEN descricao_limpa ~~* '%OUTRAS::%'::text THEN 3
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
  hora_criacao_br,
  hora_criacao_formatado,
  prazo_limite_br,
  hora_conclusao_br,
  hora_criacao_hhmm,
  prazo_limite_hhmm,
  hora_conclusao_hhmm,
  prazo_limite_formatado,
  prazo_minutos_efetivo,
  prazo_formatado,
  live_status,
  created_by_name
FROM limpeza_de_prefixos;
