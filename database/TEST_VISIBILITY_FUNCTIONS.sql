-- ============================================================================
-- TESTE DAS FUNÇÕES DE VISIBILIDADE
-- ============================================================================
-- Execute esta query no Supabase SQL Editor para testar as funções

-- 1. Testar se as funções existem
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('is_alerta_visible', 'tempo_restante_visibilidade')
ORDER BY routine_name;

-- 2. Testar a função is_alerta_visible
-- Alertas não concluídos devem retornar TRUE
SELECT 
  is_alerta_visible('alerta', NULL) as "Alerta ativo (deve ser TRUE)";

-- Alertas concluídos recentemente devem retornar TRUE
SELECT 
  is_alerta_visible('concluido', NOW() - INTERVAL '1 hour') as "Concluído há 1h (deve ser TRUE)";

-- Alertas concluídos há muito tempo devem retornar FALSE
SELECT 
  is_alerta_visible('concluido', NOW() - INTERVAL '25 hours') as "Concluído há 25h (deve ser FALSE)";

-- 3. Testar a função tempo_restante_visibilidade
-- Alertas não concluídos devem retornar NULL
SELECT 
  tempo_restante_visibilidade('alerta', NULL) as "Alerta ativo (deve ser NULL)";

-- Alertas concluídos recentemente devem retornar tempo como "Xh Ymin visível"
SELECT 
  tempo_restante_visibilidade('concluido', NOW() - INTERVAL '1 hour') as "Concluído há 1h";

-- Alertas concluídos há muito tempo devem retornar "Expirado"
SELECT 
  tempo_restante_visibilidade('concluido', NOW() - INTERVAL '25 hours') as "Concluído há 25h (deve ser Expirado)";

-- 4. Testar com dados reais da tabela alertas_paciente
SELECT 
  id,
  patient_id,
  status,
  concluded_at,
  is_alerta_visible(status, concluded_at) as visivel,
  tempo_restante_visibilidade(status, concluded_at) as tempo_restante
FROM alertas_paciente
WHERE status = 'concluido'
LIMIT 5;

-- 5. Testar com dados reais da tabela tasks
SELECT 
  id,
  patient_id,
  status,
  concluded_at,
  is_alerta_visible(status, concluded_at) as visivel,
  tempo_restante_visibilidade(status, concluded_at) as tempo_restante
FROM tasks
WHERE status = 'concluido'
LIMIT 5;
