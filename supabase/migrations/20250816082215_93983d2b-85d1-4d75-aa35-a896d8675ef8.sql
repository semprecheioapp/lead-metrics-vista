
-- Adicionar coluna tags na tabela novos_leads
ALTER TABLE public.novos_leads 
ADD COLUMN tags jsonb DEFAULT '[]'::jsonb;

-- Adicionar comentário para documentar a coluna
COMMENT ON COLUMN public.novos_leads.tags IS 'Array de tags aplicadas ao lead em formato JSON';
