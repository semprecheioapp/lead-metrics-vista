-- Adicionar campos para controle de follow-up na tabela novos_leads
ALTER TABLE public.novos_leads 
ADD COLUMN followup_count integer DEFAULT 0,
ADD COLUMN ultimo_followup timestamp with time zone;

-- Criar índice para melhor performance nas consultas de follow-up
CREATE INDEX idx_novos_leads_followup ON public.novos_leads(empresa_id, followup_count, ultimo_followup);

-- Comentários para documentar os novos campos
COMMENT ON COLUMN public.novos_leads.followup_count IS 'Contador de quantos follow-ups foram enviados para este lead';
COMMENT ON COLUMN public.novos_leads.ultimo_followup IS 'Timestamp do último follow-up enviado';