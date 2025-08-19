-- Adicionar coluna message como jsonb para armazenar conversas no formato correto
ALTER TABLE public.memoria_ai ADD COLUMN IF NOT EXISTS message jsonb;

-- Migrar dados existentes para o novo formato (se houver)
UPDATE public.memoria_ai 
SET message = jsonb_build_object(
  'role', CASE WHEN prompt IS NOT NULL THEN 'human' ELSE 'ai' END,
  'content', COALESCE(prompt, response),
  'timestamp', EXTRACT(epoch FROM created_at)
)
WHERE message IS NULL AND (prompt IS NOT NULL OR response IS NOT NULL);

-- Criar índices para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_memoria_ai_empresa_session ON public.memoria_ai(empresa_id, session_id);
CREATE INDEX IF NOT EXISTS idx_memoria_ai_message_role ON public.memoria_ai USING GIN ((message->>'role'));
CREATE INDEX IF NOT EXISTS idx_memoria_ai_created_at ON public.memoria_ai(created_at DESC);

-- Adicionar comentários para documentar a estrutura
COMMENT ON COLUMN public.memoria_ai.session_id IS 'Número de telefone do lead/cliente';
COMMENT ON COLUMN public.memoria_ai.message IS 'Objeto JSON contendo role (ai/human) e content da mensagem';
COMMENT ON COLUMN public.memoria_ai.empresa_id IS 'ID da empresa para isolamento de dados';