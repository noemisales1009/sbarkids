-- Adicionar coluna de data de referência para rastrear a qual dia pertence o registro
-- Isso permite limpar os campos no dia seguinte (00:05) e deixar em branco para novo preenchimento
-- enquanto mantém os dados anteriores salvos no histórico

ALTER TABLE public.clinical_rounds_simple 
ADD COLUMN reference_date DATE DEFAULT CURRENT_DATE;

-- Criar um índice para que a busca por data seja muito rápida
CREATE INDEX idx_clinical_rounds_reference_date 
ON public.clinical_rounds_simple (reference_date);

-- Também criar um índice composto para buscas rápidas por paciente e data
CREATE INDEX idx_clinical_rounds_patient_date
ON public.clinical_rounds_simple (patient_id, reference_date);
