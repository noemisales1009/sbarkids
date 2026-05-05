-- Função para determinar se um alerta deve ser visível
-- Retorna TRUE se:
-- 1. Alerta ainda não foi concluído/arquivado/resolvido
-- 2. Alerta foi concluído e ainda não passou das 12:00 do dia seguinte

CREATE OR REPLACE FUNCTION is_alerta_visible(
  p_status text,
  p_hora_conclusao timestamp with time zone
) RETURNS boolean AS $$
DECLARE
  agora_br timestamp;
  data_conclusao_br date;
  limite_visibilidade timestamp;
BEGIN
  IF p_status NOT IN ('concluído', 'arquivado', 'resolvido', 'concluido') THEN
    RETURN TRUE;
  END IF;

  IF p_hora_conclusao IS NULL THEN
    RETURN TRUE;
  END IF;

  agora_br := NOW() AT TIME ZONE 'America/Sao_Paulo';
  data_conclusao_br := (p_hora_conclusao AT TIME ZONE 'America/Sao_Paulo')::date;
  -- Limite: dia seguinte ao da conclusão às 12:00
  limite_visibilidade := (data_conclusao_br + interval '1 day')::timestamp + interval '12 hours';

  RETURN agora_br < limite_visibilidade;
END;
$$ LANGUAGE plpgsql STABLE;

-- Função auxiliar para determinar o tempo restante de visibilidade
-- Retorna texto no formato "Xh Ymin visível" ou "Expirado"

CREATE OR REPLACE FUNCTION tempo_restante_visibilidade(
  p_status text,
  p_hora_conclusao timestamp with time zone
) RETURNS text AS $$
DECLARE
  agora_br timestamp;
  data_conclusao_br date;
  limite_visibilidade timestamp;
  tempo_restante interval;
BEGIN
  IF p_status NOT IN ('concluído', 'arquivado', 'resolvido', 'concluido') OR p_hora_conclusao IS NULL THEN
    RETURN NULL;
  END IF;

  agora_br := NOW() AT TIME ZONE 'America/Sao_Paulo';
  data_conclusao_br := (p_hora_conclusao AT TIME ZONE 'America/Sao_Paulo')::date;
  limite_visibilidade := (data_conclusao_br + interval '1 day')::timestamp + interval '12 hours';

  IF agora_br >= limite_visibilidade THEN
    RETURN 'Expirado';
  END IF;

  tempo_restante := limite_visibilidade - agora_br;

  RETURN (EXTRACT(DAY FROM tempo_restante) * 24 + EXTRACT(HOUR FROM tempo_restante))::integer || 'h ' ||
         EXTRACT(MINUTE FROM tempo_restante)::integer || 'min visível';
END;
$$ LANGUAGE plpgsql STABLE;
