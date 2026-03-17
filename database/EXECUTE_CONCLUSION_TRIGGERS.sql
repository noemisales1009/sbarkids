-- ============================================================================
-- EXECUTAR NO SUPABASE - SQL EDITOR
-- ============================================================================
-- Cole este script inteiro no SQL Editor do Supabase e execute (Ctrl+Enter)
-- ============================================================================

-- Recriar as funções com o comportamento correto
CREATE OR REPLACE FUNCTION update_alerta_conclusion()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status foi alterado para 'concluido', preencher apenas concluded_at
  IF NEW.status = 'concluido' AND OLD.status != 'concluido' THEN
    -- Se concluded_at não foi definido, definir agora
    IF NEW.concluded_at IS NULL THEN
      NEW.concluded_at := NOW();
    END IF;
    
    -- NÃO arquivar automaticamente - alertas ficarão visíveis por 24h
    -- O arquivamento será feito manualmente pelo usuário
  END IF;

  -- Se o status foi alterado para 'arquivado', preencher data de arquivamento
  IF NEW.status = 'arquivado' AND OLD.status != 'arquivado' THEN
    IF NEW.archived_at IS NULL THEN
      NEW.archived_at := NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar a função para tasks
CREATE OR REPLACE FUNCTION update_task_conclusion()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status foi alterado para 'concluido', preencher apenas concluded_at
  IF NEW.status = 'concluido' AND OLD.status != 'concluido' THEN
    -- Se concluded_at não foi definido, definir agora
    IF NEW.concluded_at IS NULL THEN
      NEW.concluded_at := NOW();
    END IF;
    
    -- NÃO arquivar automaticamente - tarefas ficarão visíveis por 24h
    -- O arquivamento será feito manualmente pelo usuário
  END IF;

  -- Se o status foi alterado para 'arquivado', preencher data de arquivamento
  IF NEW.status = 'arquivado' AND OLD.status != 'arquivado' THEN
    IF NEW.archived_at IS NULL THEN
      NEW.archived_at := NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar os triggers
DROP TRIGGER IF EXISTS alerta_conclusion_trigger ON alertas_paciente;
CREATE TRIGGER alerta_conclusion_trigger
BEFORE UPDATE ON alertas_paciente
FOR EACH ROW
EXECUTE FUNCTION update_alerta_conclusion();

DROP TRIGGER IF EXISTS task_conclusion_trigger ON tasks;
CREATE TRIGGER task_conclusion_trigger
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_task_conclusion();

-- Verificar se os triggers foram criados
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table IN ('alertas_paciente', 'tasks');
