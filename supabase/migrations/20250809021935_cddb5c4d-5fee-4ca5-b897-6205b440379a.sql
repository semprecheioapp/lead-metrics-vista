-- Adicionar coluna message como jsonb na tabela memoria_ai
ALTER TABLE public.memoria_ai ADD COLUMN IF NOT EXISTS message jsonb;

-- Atualizar índice para incluir message type
CREATE INDEX IF NOT EXISTS idx_memoria_ai_message_type ON public.memoria_ai USING GIN ((message->>'type'));

-- Atualizar comentário da coluna message
COMMENT ON COLUMN public.memoria_ai.message IS 'Objeto JSON contendo type (ai/human), content, additional_kwargs e response_metadata';