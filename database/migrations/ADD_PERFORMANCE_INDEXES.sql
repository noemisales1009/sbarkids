-- ÍNDICES DE PERFORMANCE (Acelerar tabelas sem mudar lógica das Views)
-- Execute este script no SQL Editor do Supabase

-- 1. Índices para a tabela ALERTAS_PACIENTE
-- Acelera o filtro por paciente (essencial para as views filtrares rápido)
CREATE INDEX IF NOT EXISTS idx_alertas_patient_id ON public.alertas_paciente(patient_id);
-- Acelera a ordenação por data (usada na listagem)
CREATE INDEX IF NOT EXISTS idx_alertas_created_at ON public.alertas_paciente(created_at DESC);
-- Acelera filtros de status (ex: saber o que está pendente)
CREATE INDEX IF NOT EXISTS idx_alertas_status ON public.alertas_paciente(status);

-- 2. Índices para a tabela TASKS
-- Acelera o filtro por paciente
CREATE INDEX IF NOT EXISTS idx_tasks_patient_id ON public.tasks(patient_id);
-- Acelera a ordenação e cálculos de data
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);
-- Acelera filtro por status ('alerta', 'concluido', etc)
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- 3. Índices para tabela PATIENTS (Geral)
CREATE INDEX IF NOT EXISTS idx_patients_bed ON public.patients(bed_number);
CREATE INDEX IF NOT EXISTS idx_patients_name ON public.patients(name);

-- 4. VACUUM ANALYZE para atualizar estatísticas do banco imediatamente
ANALYZE public.alertas_paciente;
ANALYZE public.tasks;
ANALYZE public.patients;
