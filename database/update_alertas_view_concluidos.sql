-- Atualizar view para mostrar alertas concluídos como "resolvido / arquivado"
drop view if exists public.alertas_paciente_view_completa cascade;

create view public.alertas_paciente_view_completa as
with
  pre_base as (
    select
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
      get_shift (ap.created_at) as shift_criacao,
      case
        when regexp_replace(
          ap.hora_selecionada,
          '[^0-9]'::text,
          ''::text,
          'g'::text
        ) = ''::text then ap.created_at + '02:00:00'::interval
        else ap.created_at + (
          (
            regexp_replace(
              ap.hora_selecionada,
              '[^0-9]'::text,
              ''::text,
              'g'::text
            ) || ' hours'::text
          )::interval
        )
      end as deadline_calculado
    from
      alertas_paciente ap
  ),
  base as (
    select
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
      p.name as patient_name,
      p.bed_number,
      COALESCE(u.name, 'Não informado'::text) as created_by_name,
      COALESCE(uc.name, 'Não informado'::text) as concluded_by_name,
      round(
        EXTRACT(
          epoch
          from
            t.deadline_calculado - t.created_at
        ) / 60::numeric
      ) as prazo_minutos_efetivo
    from
      pre_base t
      left join patients p on t.patient_id = p.id
      left join users u on t.created_by = u.id
      left join users uc on t.concluded_by = uc.id
  )
select
  id as id_alerta,
  to_char(
    (created_at AT TIME ZONE 'America/Sao_Paulo'::text),
    'DD/MM/YYYY HH24:MI'::text
  ) as hora_criacao_formatado,
  patient_id,
  patient_name,
  bed_number,
  created_by_name,
  alerta_descricao as alertaclinico,
  responsavel,
  case
    when archived_at is not null then 'resolvido / arquivado'::text
    when status = 'concluido'::text then 'resolvido / arquivado'::text
    else status
  end as status,
  justificativa,
  created_at,
  deadline_calculado as deadline,
  updated_at,
  archived_at,
  concluded_at,
  concluded_by_name,
  shift_criacao,
  to_char(
    (
      deadline_calculado AT TIME ZONE 'America/Sao_Paulo'::text
    ),
    'DD/MM/YYYY HH24:MI'::text
  ) as prazo_limite_formatado,
  case
    when prazo_minutos_efetivo >= 60::numeric then (prazo_minutos_efetivo / 60::numeric)::integer || ' horas'::text
    else prazo_minutos_efetivo || ' min'::text
  end as prazo_formatado,
  case
    when archived_at is not null then 'resolvido / arquivado'::text
    when status = 'concluido'::text then 'resolvido / arquivado'::text
    when deadline_calculado < now()
    and (
      justificativa is null
      or justificativa = ''::text
    ) then 'fora_do_prazo'::text
    when deadline_calculado < now()
    and justificativa is not null
    and justificativa <> ''::text then 'fora_do_prazo_com_justificativa'::text
    else 'no_prazo'::text
  end as live_status
from
  base;
