-- Função para determinar se um alerta deve ser visível
-- Retorna TRUE se:
-- 1. Alerta ainda não foi concluído (status != 'concluido')
-- 2. Alerta foi concluído há menos de 24 horas

CREATE OR REPLACE FUNCTION is_alerta_visible(
  p_status text,
  p_hora_conclusao timestamp with time zone
) RETURNS boolean AS $$
DECLARE
  agora_br timestamp;
  tempo_decorrido interval;
BEGIN
  -- Se não foi concluído, está visível
  IF p_status NOT IN ('concluido', 'Concluído') THEN
    RETURN TRUE;
  END IF;

  -- Se foi concluído, verificar se está dentro de 24 horas
  IF p_hora_conclusao IS NULL THEN
    RETURN TRUE; -- Se por algum motivo não temos a hora de conclusão, mostrar
  END IF;

  -- Converter hora atual para São Paulo
  agora_br := NOW() AT TIME ZONE 'America/Sao_Paulo';
  
  -- Calcular tempo decorrido desde conclusão
  tempo_decorrido := agora_br - p_hora_conclusao;
  
  -- Retornar TRUE se passou menos de 24 horas
  RETURN tempo_decorrido < interval '24 hours';
END;
$$ LANGUAGE plpgsql STABLE;

-- Função auxiliar para determinar o tempo restante (em horas e minutos)
CREATE OR REPLACE FUNCTION tempo_restante_visibilidade(
  p_status text,
  p_hora_conclusao timestamp with time zone
) RETURNS text AS $$
DECLARE
  agora_br timestamp;
  tempo_decorrido interval;
  horas_restantes numeric;
  minutos_restantes numeric;
  resultado text;
BEGIN
  -- Se não foi concluído
  IF p_status NOT IN ('concluido', 'Concluído') THEN
    RETURN NULL;
  END IF;

  -- Se hora de conclusão é NULL
  IF p_hora_conclusao IS NULL THEN
    RETURN NULL;
  END IF;

  agora_br := NOW() AT TIME ZONE 'America/Sao_Paulo';
  tempo_decorrido := agora_br - p_hora_conclusao;

  -- Se passou 24 horas
  IF tempo_decorrido >= interval '24 hours' THEN
    RETURN 'Expirado';
  END IF;

  -- Calcular horas e minutos restantes
  horas_restantes := EXTRACT(HOUR FROM (interval '24 hours' - tempo_decorrido));
  minutos_restantes := EXTRACT(MINUTE FROM (interval '24 hours' - tempo_decorrido));

  RETURN horas_restantes || 'h ' || minutos_restantes || 'min visível';
END;
$$ LANGUAGE plpgsql STABLE;
