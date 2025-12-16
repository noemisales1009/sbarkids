-- ============================================================================
-- Atualizar tabela patients com status e melhorias
-- Execute este SQL no console do Supabase
-- ============================================================================

-- 1. Adicionar coluna status se não existir
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS status character varying(50) DEFAULT 'estavel';

-- 2. Criar índice em status para melhor performance
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients USING btree (status);

-- 3. Criar função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Criar trigger para atualizar updated_at antes de cada UPDATE
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;

CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Verificar se as alterações foram aplicadas
-- ============================================================================
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name='patients' AND column_name='status';
