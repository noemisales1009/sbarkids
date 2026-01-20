-- ============================================================================
-- Verificar dados existentes nas tabelas Background
-- Execute estes comandos no Supabase SQL Editor para verificar os dados
-- ============================================================================

-- 1. Verificar Medicações
SELECT * FROM public.medicacoes_pacientes 
WHERE is_archived = false 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Verificar Dispositivos  
SELECT * FROM public.dispositivos_pacientes 
WHERE is_archived = false 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Verificar Culturas
SELECT * FROM public.culturas_pacientes 
WHERE is_archived = false 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Verificar Procedimentos
SELECT * FROM public.procedimentos_pacientes 
WHERE is_archived = false 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. Verificar Exames (se já criada)
SELECT * FROM public.exames_pacientes 
WHERE is_archived = false 
ORDER BY created_at DESC 
LIMIT 10;

-- 6. Verificar Dietas (se já criada)
SELECT * FROM public.dietas_pacientes 
WHERE is_archived = false 
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================================================
-- Verificar paciente específico (substitua o UUID pelo ID do paciente)
-- ============================================================================
-- SELECT * FROM public.medicacoes_pacientes WHERE paciente_id = 'SEU-PACIENTE-ID-AQUI';
