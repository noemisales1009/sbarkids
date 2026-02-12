-- ============================================================================
-- FIX: Adicionar políticas RLS para clinical_rounds_simple
-- Resolve erro 406 ao acessar a tabela
-- ============================================================================

-- 1. Habilitar RLS na tabela
ALTER TABLE public.clinical_rounds_simple ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas para permitir acesso anônimo (similar a outras tabelas)

-- Permitir leitura para todos
CREATE POLICY "Anon can read all clinical_rounds_simple"
  ON public.clinical_rounds_simple
  FOR SELECT
  USING (true);

-- Permitir inserção para todos
CREATE POLICY "Anon can insert clinical_rounds_simple"
  ON public.clinical_rounds_simple
  FOR INSERT
  WITH CHECK (true);

-- Permitir atualização para todos
CREATE POLICY "Anon can update clinical_rounds_simple"
  ON public.clinical_rounds_simple
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Permitir exclusão para todos
CREATE POLICY "Anon can delete clinical_rounds_simple"
  ON public.clinical_rounds_simple
  FOR DELETE
  USING (true);

-- ============================================================================
-- NOTA: Essas políticas permitem acesso completo (anônimo) à tabela.
-- Se você precisar de controle de acesso mais restrito, modifique as políticas
-- para verificar auth.uid() ou outras condições de segurança.
-- ============================================================================
