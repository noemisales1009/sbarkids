-- ============================================================================
-- FUNÇÕES E TRIGGERS PARA CONCLUSÃO E ARQUIVAMENTO DE ALERTAS E TAREFAS
-- ============================================================================

-- ============================================================================
-- FUNÇÃO PARA PREENCHER DADOS DE CONCLUSÃO EM alertas_paciente
-- ============================================================================
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
    -- O arquivamento será feito manualmente pelo usuário ou após 24h
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

-- ============================================================================
-- FUNÇÃO PARA PREENCHER DADOS DE CONCLUSÃO EM tasks
-- ============================================================================
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
    -- O arquivamento será feito manualmente pelo usuário ou após 24h
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

-- ============================================================================
-- TRIGGERS para alertas_paciente
-- ============================================================================
DROP TRIGGER IF EXISTS alerta_conclusion_trigger ON alertas_paciente;

CREATE TRIGGER alerta_conclusion_trigger
BEFORE UPDATE ON alertas_paciente
FOR EACH ROW
EXECUTE FUNCTION update_alerta_conclusion();

-- ============================================================================
-- TRIGGERS para tasks
-- ============================================================================
DROP TRIGGER IF EXISTS task_conclusion_trigger ON tasks;

CREATE TRIGGER task_conclusion_trigger
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_task_conclusion();

-- ============================================================================
-- Comentários explicativos
-- ============================================================================
/*
COMO FUNCIONA:

1. ALERTAS_PACIENTE:
   - Quando status muda para 'concluido':
     * concluded_at é preenchido com NOW()
     * archived_at é preenchido com NOW() (automático)
     * motivo_arquivamento é preenchido com "Alerta concluído automaticamente"
     * concluded_by e archived_by podem ser preenchidos pela aplicação

   - Quando status muda para 'arquivado':
     * archived_at é preenchido com NOW() (se não tiver sido preenchido)
     * motivo_arquivamento pode ser preenchido pela aplicação

2. TASKS:
   - Mesmo comportamento que alertas_paciente

3. Os campos concluded_by e archived_by são preenchidos pela APLICAÇÃO
   (via TypeScript/Node.js), pois o trigger não tem acesso ao contexto do usuário.

EXEMPLO DE USO NA APLICAÇÃO:
   await supabase
     .from('alertas_paciente')
     .update({
       status: 'concluido',
       concluded_by: userId,      // Preenchido pela app
       archived_by: userId,        // Preenchido pela app
       // concluded_at e archived_at são preenchidos automaticamente pelo trigger
     })
     .eq('id', alertaId);
*/
